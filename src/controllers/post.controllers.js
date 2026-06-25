
import { text } from "express";
import { Comment } from "../models/comment.models.js";
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

        await User.findByIdAndUpdate(verifyUser, {
                $push: { post: uploadPost._id }
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



const likes = asyncHandler(async (req, res) => {
    try {
        const verifyUser = await User.findById(req.user?._id); 
        if (!verifyUser) {
            throw new ApiError(400, 'Bad request: User not found');
        }  
    
        const { postId } = req.body; 
        
        // 1. ADDED AWAIT HERE
        const verifyPost = await Post.findById(postId);
        if (!verifyPost) {
            throw new ApiError(404, "Post doesn't exist"); // 404 is more accurate for "not found"
        }
    
        // 2. Safely check if already liked (converting ObjectIds to strings for accurate comparison)
        const hasLiked = verifyPost.likes.some(id => id.toString() === verifyUser._id.toString());
        if (hasLiked) {
            throw new ApiError(400, "You have already liked this post");
        }
    
        // 3. Push user ID into the Post's likes array
        await Post.findByIdAndUpdate(postId, {
            $push: { likes: verifyUser._id }
        });
        
        // 4. FIXED: Push the POST ID into the LIKING USER's array
        await User.findByIdAndUpdate(verifyUser._id, {
            $push: { likes: postId }
        });

        return res.status(200).json({
            success: true, 
            message: "Post liked successfully",
            // Note: verifyPost here holds the old state from before the update. 
            // If you want to return the updated post, fetch it again or manage it manually.
            data: verifyPost 
        }); 

    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Internal Server Error"); 
    }
});




const comments = asyncHandler(async (req, res) => {
    try {
        const verifyUser = await User.findById(req.user?._id); 
        if (!verifyUser) {
            throw new ApiError(400, 'Bad request: User not found');
        }  
    
        const { postId, usercomment } = req.body; 
        
        // 1. Verify the post exists
        const verifyPost = await Post.findById(postId);
        if (!verifyPost) {
            throw new ApiError(404, "Post doesn't exist");
        }
    
        // 2. Create the new comment document
        // Note: Added text field assuming your Comment schema will hold the actual string text
        const newComment = await Comment.create({
            sender: verifyUser._id, 
            receiver: verifyPost.author, // The author of the post gets the comment
            post: verifyPost._id,
            text: usercomment // Make sure to add 'text' field to your commentSchema!
        });
        
        // 3. FIXED: Push the NEW COMMENT's ID into the POST's Comment array
        await Post.findByIdAndUpdate(postId, {
            $push: { Comment: newComment._id } 
        });

        return res.status(200).json({
            success: true, 
            message: "Comment added successfully",
            data: newComment 
        }); 

    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message || "Internal Server Error"); 
    }
});


export { post , likes , comments };