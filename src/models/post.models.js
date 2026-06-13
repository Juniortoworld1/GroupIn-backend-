import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: "" },
  
  // Media configuration
  mediaUrl: { type: String, default: "" }, // URL hosting the photo or video file
  mediaType: { 
    type: String, 
    enum: ['none', 'photo', 'video'], 
    default: 'none' 
  },
  
  // Privacy control requested
  privacy: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'public' 
  },
  
  // We store User IDs here. If a user's ID is in this array, they liked it. 
  // The total likes = likes.length
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Track shares by saving references to users who reshared it
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  createdAt: { type: Date, default: Date.now }
});

export const Post= mongoose.model('Post', PostSchema);