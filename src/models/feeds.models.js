import { Timestamp } from "mongodb";

// post.model.js
const PostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: "" },
  mediaUrl: [{ type: String, default: "" }],
  mediaType: [{ type: String, enum: ['none', 'photo', 'video'], default: 'none' }],
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  
  // Array of user IDs who liked this post
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Array of comment IDs linked to this post
  Comment: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
} , {timestamps: true});