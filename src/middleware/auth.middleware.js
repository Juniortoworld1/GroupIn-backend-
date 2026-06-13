
import { User } from "../models/register.models.js";
import { ApiError } from "../utils/apiError.utils.js";
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.utils.js";

export const verifyJWT = asyncHandler(async (req , res , next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer" , "")
        if(!token){
            throw new ApiError(401 , "Unauthorization request")

        }


        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")  

        if(!user){
            throw new ApiError(401, "Invalid Access")
        }

        req.user = user ; 
        next()
    }catch(error){
        throw new ApiError(401 , error?.message||"Access Denied ")
    }
})