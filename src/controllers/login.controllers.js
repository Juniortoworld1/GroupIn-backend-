import {asyncHandler} from '../utils/asyncHandler.utils.js'
import { User } from '../models/register.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.utils.js';
import { upload } from '../middleware/multer.middleware.js';
import { ApiError } from '../utils/apiError.utils.js';
import { ApiResponse } from '../utils/apiResponse.utils.js';
import { generateAccessRefreshToken } from './tokens.js';
import cookie from 'cookie-parser'

const login = asyncHandler(async (req , res) =>{
    const {username , password} = req.body ;

    let isUser ; 

    if (!username || !password){
        throw new ApiError(400 , "Incorrect Credientials")
    }
    if(username.includes("@")){
        isUser = await User.findOne({email:username})
    }else{
        isUser = await User.findOne({username})
    }

    

    if(!isUser) throw new ApiError(400, "Incorrect Credientials") ;

    const isMatch = await isUser.isPasswordCorrect(password)

    if(!isMatch) throw new ApiError(400 , "Incorrect Credientails") ;
    console.log(isUser._id)

    const {refreshTokens , accessTokens} = await generateAccessRefreshToken(isUser._id) ; 

    let loggedIn ;
    if(username.includes("@")){
        loggedIn = await User.findOne({email:username})
    }else{
        loggedIn = await User.findOne({username})
    }

    
    console.log(`\n\n\n\n${loggedIn._id.accessTokens}`)
    const createUser = await User.findById(loggedIn._id).select("-password -refreshToken"); 

    const options = {
        httpOnly: true , 
        secure:true 
    }  

    

    return res.status(200).cookie("accessToken" , accessTokens , options)
    .cookie("refreshToken" , refreshTokens , options).json(new ApiResponse(200 , {createUser} , "Success"))





} )

export {login}