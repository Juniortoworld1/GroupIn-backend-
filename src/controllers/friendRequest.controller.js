import { User } from "../models/register.models.js";
import { FriendRequest } from "../models/friendRequest.models.js"; // Make sure to import your FriendRequest model
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js"; // Assuming you have an ApiResponse utility

// ==========================================
// 1. SEND A FRIEND REQUEST
// ==========================================
const sendFriendRequest = asyncHandler(async (req, res) => {
    // req.user._id is extracted from your auth middleware
    const senderId = req.user?._id; 
    const { senderUsername } = req.body; // The ID of the person you want to add
    const receivers = await User.findOne({username:senderUsername}) 
    if(!receivers) throw new ApiError(400 , "User not found ") ; 
    const receiverId = receivers._id ;

    if (!receiverId) {
        throw new ApiError(400, "Receiver ID is required");
    }

    // Prevents sending a request to yourself
    if (senderId.toString() === receiverId.toString()) {
        throw new ApiError(400, "You cannot send a friend request to yourself");
    }

    // Check if the receiver actually exists
    const receiverExists = await User.findById(receiverId);
    if (!receiverExists) {
        throw new ApiError(404, "User not found");
    }

    // Check if they are already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiverId)) {
        throw new ApiError(400, "You are already friends with this user");
    }

    // Check if an active request already exists between these two users
    const existingRequest = await FriendRequest.findOne({
        $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId }
        ]
    });

    if (existingRequest) {
        throw new ApiError(400, `Friend request already exists and is ${existingRequest.status}`);
    }

    // Create the new pending request
    const newRequest = await FriendRequest.create({
        sender: senderId,
        receiver: receiverId,
        status: "pending"
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newRequest, "Friend request sent successfully"));
});

// ==========================================
// 2. ACCEPT A FRIEND REQUEST
// ==========================================
const acceptFriendRequest = asyncHandler(async (req, res) => {
    const currentUserId = req.user?._id;
    const { senderUsername } = req.body; // The unique ID of the friend request document

    
    if (!senderUsername) {
        throw new ApiError(400, "Request ID is required");
    }

    const requestUserId = await User.findOne({username:senderUsername}) 
    if(!requestUserId) throw new ApiError(400 , "User not found ") ; 
    const requestId = requestUserId._id ;

    console.log(`\n\n\n request id ${requestId}`) 
    

    // Find the request and verify the current user is the actual receiver
    const request = await FriendRequest.findOne({sender:requestId})
    if (!request) {
        throw new ApiError(404, "Friend request not found");
    }

    if (request.receiver.toString() !== currentUserId.toString()) {
        throw new ApiError(403, "You do not have permission to accept this request");
    }

    if (request.status !== "pending") {
        throw new ApiError(400, `This request has already been ${request.status}`);
    }

    // Update request status to accepted
    request.status = "accepted";
    await request.save();

    // CRITICAL: Simultaneously add each other to their respective 'friends' arrays
    // $addToSet prevents adding duplicates just in case
    await User.findByIdAndUpdate(request.sender, {
        $addToSet: { friends: request.receiver }
    });

    await User.findByIdAndUpdate(request.receiver, {
        $addToSet: { friends: request.sender }
    });

    await FriendRequest.findByIdAndDelete(request._id);

    // Optional: Delete the request document now that they are friends to keep DB clean, 
    // or leave it updated so you can track history. We will keep it for history tracking.

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Friend request accepted successfully. You are now friends!"));
});

// ==========================================
// 3. REJECT A FRIEND REQUEST
// ==========================================
const rejectFriendRequest = asyncHandler(async (req, res) => {
    const currentUserId = req.user?._id;
    const { requestId } = req.body;

    if (!requestId) {
        throw new ApiError(400, "Request ID is required");
    }

    const request = await FriendRequest.findById(requestId);
    if (!request) {
        throw new ApiError(404, "Friend request not found");
    }

    // Ensure the person rejecting it is the receiver
    if (request.receiver.toString() !== currentUserId.toString()) {
        throw new ApiError(403, "You do not have permission to reject this request");
    }

    // Instead of changing status to 'rejected', deleting it allows them to send a request again later
    await FriendRequest.findByIdAndDelete(requestId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Friend request rejected and removed"));
});

export {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest
};