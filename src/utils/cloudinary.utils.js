import {v2 as cloudinary} from "cloudinary" 
import fs from "fs"

cloudinary.config({
    cloud_name:`${process.env.CLOUDINARY_NAME}` , 
    api_key: `${process.env.CLOUDINARY_API}`, 
    api_secret: `${process.env.CLOUDINARY_API_SECRET}`, 
    secure: true 
    
})
const uploadOnCloudinary =async (localFilePath)=>{
    try{
        if(!localFilePath) return console.log("couldn't find path ")
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type:"auto"
        })

        console.log('file is uploaded on :  ' , response.url)

        if (fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }

        return response
    }catch(error){
        console.error("❌ CLOUDINARY UPLOAD ERROR:", error);
        fs.unlinkSync(localFilePath); // ✅ Safe, synchronous, no callback needed!
        return null;

    }
}

export {uploadOnCloudinary}