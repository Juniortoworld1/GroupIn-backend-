import { User } from "../models/register.models.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";


const logOut = asyncHandler(async (req , res)=>{
    console.log(`\n\n\n\n\n\n\n\n\n${req.user._id} logout `)
    await User.findByIdAndUpdate(req.user._id , {$set:{refreshToken:undefined}})
    
    const options = {
        httpOnly:true, 
        secure:true
    }

    return res.status(200).clearCookie("accessToken" , options).clearCookie("refreshToken" , options).json(
        new ApiResponse(200 , {} , "Logged Out ")
    )

})

export {logOut}