import {asyncHandler} from '../utils/asyncHandler.utils.js'
import { User } from '../models/register.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.utils.js';
import { upload } from '../middleware/multer.middleware.js';
import { ApiError } from '../utils/apiError.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';
import { generateAccessRefreshToken } from './tokens.js';
import cookie from 'cookie-parser'

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ApiError(400, "Incorrect Credentials");
    }

    // 1. Find user by either email or username
    let isUser;
    if (username.includes("@")) {
        isUser = await User.findOne({ email: username });
    } else {
        isUser = await User.findOne({ username });
    }

    if (!isUser) throw new ApiError(400, "Incorrect Credentials");

    // 2. Validate Password
    const isMatch = await isUser.isPasswordCorrect(password);
    if (!isMatch) throw new ApiError(400, "Incorrect Credentials");

    // 3. Generate tokens
    const { refreshTokens, accessTokens } = await generateAccessRefreshToken(isUser._id); 

    // 4. CRITICAL STEP: Save the refresh token to the database!
    isUser.refreshToken = refreshTokens; 
    await isUser.save({ validateBeforeSave: false }); // Saves it directly without re-triggering validators

    // 5. Fetch the user without password and refreshToken for the response
    const loggedInUser = await User.findById(isUser._id).select("-password -refreshToken"); 

    const options = {
        httpOnly: true, 
        secure: true 
    };  

    // 6. Send response with cookies and JSON data
    return res
        .status(200)
        .cookie("accessToken", accessTokens, options)
        .cookie("refreshToken", refreshTokens, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken: accessTokens }, "Success"));
});

export {login}