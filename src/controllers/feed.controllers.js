import { Post } from "../models/post.models.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";


export const getHomePageFeed = asyncHandler(async (req, res) => {
    try {
        // Fetch all public posts, sorted by newest first
        const feedPosts = await Post.find({ privacy: "public" })
            .sort({ createdAt: -1 }) // Newest posts at the top
            .populate({
                path: "author",
                select: "username fullName avatar" // Only fetch necessary user details
            })
            .populate({
                path: "Comment",
                populate: {
                    path: "sender", // Deeply populate the user who wrote the comment
                    select: "username avatar"
                }
            })
            .populate({
                path: "likes",
                select: "username" // Optional: If you want to show a list of names who liked it
            });

        return res.status(200).json({
            success: true,
            count: feedPosts.length,
            message: "Home page feed fetched successfully",
            data: feedPosts
        });

    } catch (error) {
        throw new ApiError(500, error.message || "Failed to load home page feed");
    }
});