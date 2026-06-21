import { Post } from "../models/post.models.js";
import { User } from "../models/register.models.js";
import { ApiError } from "../utils/apiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";

const post = asyncHandler(async (req, res) => {
    try {
        const verifyUser = await User.findById(req.user?._id);
        if (!verifyUser) {
            throw new ApiError(401, "Unauthorized Access");
        }

        let { message , privacy } = req.body;
        if (!message) {
            message = "";
        }
        if(!privacy){
            privacy='public'
        }
    

        const postFile = req.file || (req.files?.postImg ? req.files.postImg[0] : null);
        const postLocalPath = postFile?.path ?? "";
        console.log(`\n\n\n\n\n\n\n\n${postLocalPath} postlocalpath`)

        let uploadedMedia = null;
        let mediaType = "none"; 

        if (postLocalPath) {
            uploadedMedia = await uploadOnCloudinary(postLocalPath);
            console.log(`\n\n\n\n\n\n\n\n${uploadedMedia} uploadedmedia`)

            if (!uploadedMedia) {
                throw new ApiError(400, "File failed to upload to cloud storage");
            }

            if (postFile.mimetype?.startsWith("image/")) {
                mediaType = "photo";
            } else if (postFile.mimetype?.startsWith("video/")) {
                mediaType = "video";
            } else {
                mediaType = "none"; 
            }
        }

        if (!message && !postLocalPath) {
            throw new ApiError(400, "Cannot create an empty post. Provide a message or a file.");
        }

        const uploadPost = await Post.create({
            author: req.user._id, 
            text: message,
            mediaType: mediaType,
            mediaUrl: uploadedMedia?.url ?? "", 
            privacy:privacy
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: uploadPost,
        });

    } catch (e) {
        throw new ApiError(e.statusCode || 500, e.message || "Internal Server Error");
    }
});

export { post };