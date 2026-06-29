import { asyncHandler } from '../utils/asyncHandler.utils.js'
import { User } from '../models/register.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.utils.js';
import { upload } from '../middleware/multer.middleware.js';
import { ApiError } from '../utils/apiError.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
    if (!fullName || !email || !username || !password) {
        throw new ApiError(400, "All fields (fullName, email, username, password) are required");
    }

    if (!email.includes("@")) {
        throw new ApiError(400, "Invalid email format");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] })

    if (existedUser) {
        throw new ApiError(409, "User Existed", false)
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path ?? "";

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required ", false)
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "avatar is required")
    }

    console.log(`\n\n\n\n\n\n ${avatar.secure_url}`)

    const user = await User.create({
        fullName,
        avatar: avatar.secure_url,                 // ✅ was avatar.url
        coverImage: coverImage?.secure_url || "",  // ✅ was coverImage?.url
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    console.log(`\n\n\nUser: ${createdUser}`)

    if (!createdUser) {
        throw new ApiError(500, "failed registering the user !!!!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

export { registerUser }