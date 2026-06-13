import { User } from "../models/register.models.js"
import { ApiError } from "../utils/apiError.utils.js";



const generateAccessRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId) ; 
        if(!user){
            throw new ApiError(404 , "User not found ")

        }
        const accessToken = user.generateAccessToken() ; 
        const refreshToken = user.generateRefreshToken() ; 

        user.refreshToken = refreshToken ; 
        await user.save({validateBeforeSave:false}) ; 
        return {accessTokens:accessToken , refreshTokens: refreshToken}

    }catch(error){
        throw new ApiError(500 , "token not injucted")
    }
}

export {generateAccessRefreshToken}