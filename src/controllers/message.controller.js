import { User } from "../models/register.models.js";
import { ApiError } from "../utils/apiError.utils.js";
import { asyncHandler } from "../utils/asyncHandler.utils.js";
import { Message } from "../models/message.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import mongoose from "mongoose"; 

// =========================================================================
// 1. SEND MESSAGE CONTROLLER
// =========================================================================
const message = asyncHandler(async (req, res) => {
    const senderId = req.user?._id; 
    if (!senderId) {
        throw new ApiError(401, "Unauthorized access");
    }

    const { receiver_id, text } = req.body; 

    if (!receiver_id) {
        throw new ApiError(400, "Receiver ID is required");
    }

    const receiver = await User.findById(receiver_id); 
    if (!receiver) {
        throw new ApiError(404, "Receiver not found");
    }

    const sender = await User.findById(senderId);
    if (!sender) {
        throw new ApiError(404, "Sender profile not found");
    }

    const isSenderFriend = sender.friends?.includes(receiver_id);
    const isReceiverFriend = receiver.friends?.includes(senderId);

    if (!isSenderFriend || !isReceiverFriend) {
        throw new ApiError(403, "You can only message users who are your friends");
    }

    let finalMediaUrl = "";
    let finalMediaType = "none";

    if (req.files && req.files.messagePic && req.files.messagePic.length > 0) {
        const localMediaPath = req.files.messagePic[0].path;
        const mimeType = req.files.messagePic[0].mimetype || "";

        if (mimeType.startsWith("image/")) {
            finalMediaType = "image";
        } else if (mimeType.startsWith("video/")) {
            finalMediaType = "video";
        } else if (mimeType.startsWith("audio/")) {
            finalMediaType = "audio";
        } else if (mimeType.length > 0) {
            finalMediaType = "file";
        }

        const cloudinaryResponse = await uploadOnCloudinary(localMediaPath);
        if (cloudinaryResponse) {
            finalMediaUrl = cloudinaryResponse.secure_url;
        } else {
            throw new ApiError(500, "Media upload failed");
        }
    }

    if (!text && finalMediaType === "none") {
        throw new ApiError(400, "No content to send! Message cannot be completely empty.");
    }

    const newMessage = await Message.create({
        sender: senderId,       
        receiver: receiver_id,   
        text: text || "", 
        mediaUrl: finalMediaUrl, 
        mediaType: finalMediaType, 
        status: "sent"             
    }); 

    return res
        .status(201)
        .json(new ApiResponse(201, newMessage, "Message sent successfully"));
});

// =========================================================================
// 2. READ/FETCH MESSAGE CONTROLLER
// =========================================================================
const readMessageSendByFriend = asyncHandler(async (req, res) => {
    // 1. Authenticate and convert receiverId (You) safely to ObjectId
    if (!req.user?._id) throw new ApiError(401, "Unauthorized access");
    const receiverId = new mongoose.Types.ObjectId(req.user._id); 

    // 2. Destructure and find the other user (Sender)
    const { senderUsername } = req.body; 
    if (!senderUsername) throw new ApiError(400, "Sender username is required"); 

    const senderUser = await User.findOne({ username: senderUsername }); 
    if (!senderUser) throw new ApiError(404, "Sender user not found in database"); 

    const senderId = new mongoose.Types.ObjectId(senderUser._id);

    // 3. Friendship validation
    const isFriend = senderUser.friends?.some(friendId => friendId.equals(receiverId));
    if (!isFriend) {
        throw new ApiError(403, "You both are not friends");
    }

    // 4. Fetch ALL messages exchanged between you two (Both directions)
    // This leaves the statuses ("sent") completely untouched in your database.

    await Message.updateMany(
        {
            sender: senderId,
            receiver: receiverId,
            Status: "sent" // ⚠️ Remember to use lowercase 'status' based on your schema fix
        },
        {
            $set: { Status: "read" }
        }
    );

    const conversationHistory = await Message.find({
        $or: [
            { sender: senderId, receiver: receiverId }, // Messages they sent to yo
        ]
    }).sort({ createdAt: -1 }); // Sorts chronologically (Oldest to Newest)

    // 5. Send back the clean list of messages
    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            conversationHistory, 
            "All conversation messages retrieved successfully."
        ));
});

const readMessageSendUs = asyncHandler(async (req, res) => {
    // 1. Authenticate and convert receiverId (You) safely to ObjectId
    if (!req.user?._id) throw new ApiError(401, "Unauthorized access");
    const receiverId = new mongoose.Types.ObjectId(req.user._id); 

    // 2. Destructure and find the other user (Sender)
    const { senderUsername } = req.body; 
    if (!senderUsername) throw new ApiError(400, "Sender username is required"); 

    const senderUser = await User.findOne({ username: senderUsername }); 
    if (!senderUser) throw new ApiError(404, "Sender user not found in database"); 

    const senderId = new mongoose.Types.ObjectId(senderUser._id);

    // 3. Friendship validation
    const isFriend = senderUser.friends?.some(friendId => friendId.equals(receiverId));
    if (!isFriend) {
        throw new ApiError(403, "You both are not friends");
    }

    // 4. Fetch ALL messages exchanged between you two (Both directions)
    // This leaves the statuses ("sent") completely untouched in your databas

    const conversationHistory = await Message.find({
        $or: [
            { sender: receiverId, receiver: senderId }, // Messages they sent to yo
        ]
    }).sort({ createdAt: -1 }); // Sorts chronologically (Oldest to Newest)

    // 5. Send back the clean list of messages
    return res
        .status(200)
        .json(new ApiResponse(
            200, 
            conversationHistory, 
            "All conversation messages retrieved successfully."
        ));
});

export { message , readMessageSendByFriend , readMessageSendUs };