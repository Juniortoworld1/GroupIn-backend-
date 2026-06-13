import mongoose from "mongoose";

const FriendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

// Prevents duplicate active friend requests between the same two people
FriendRequestSchema.index({ sender: 1, receiver: 1 }, { unique: true });

export const FriendRequest = mongoose.model('FriendRequest', FriendRequestSchema);