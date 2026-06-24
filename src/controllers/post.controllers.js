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

        let { message, privacy } = req.body;
        if (!message) message = "";
        if (!privacy) privacy = 'public';

        // 1. Get all uploaded files (handles both fields or single file middleware layouts)
        let postFiles = [];
        if (req.files?.postImg) {
            postFiles = req.files.postImg; // This is already an array
        } else if (req.file) {
            postFiles = [req.file]; // Wrap single file in an array
        }

        // Enforce the 3-image maximum limit manually just in case
        if (postFiles.length > 3) {
            throw new ApiError(400, "You can upload a maximum of 3 images.");
        }

        if (!message && postFiles.length === 0) {
            throw new ApiError(400, "Cannot create an empty post. Provide a message or a file.");
        }

        // 2. Loop through all files and upload them to Cloudinary concurrently
        const uploadPromises = postFiles.map(async (file) => {
            if (!file.path) return null;
            
            const uploadedMedia = await uploadOnCloudinary(file.path);
            if (!uploadedMedia) {
                throw new ApiError(400, `File ${file.originalname} failed to upload to cloud storage`);
            }

            let mediaType = "none";
            if (file.mimetype?.startsWith("image/")) {
                mediaType = "photo";
            } else if (file.mimetype?.startsWith("video/")) {
                mediaType = "video";
            }

            return {
                url: uploadedMedia.url,
                type: mediaType
            };
        });

        // Wait for all uploads to complete
        const uploadedFilesResults = (await Promise.all(uploadPromises)).filter(Boolean);

        // 3. Extract urls and types into arrays
        const mediaUrls = uploadedFilesResults.map(item => item.url);
        const mediaTypes = uploadedFilesResults.map(item => item.type);

        // 4. Save to Database
        // NOTE: Make sure your Post schema accepts Arrays for mediaUrl and mediaType!
        const uploadPost = await Post.create({
            author: req.user._id, 
            text: message,
            mediaType: mediaTypes.length > 0 ? mediaTypes : ["none"], // Array or string based on your schema
            mediaUrl: mediaUrls, // Array of URLs
            privacy: privacy
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