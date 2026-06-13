import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  // Who sent the message
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // Who is receiving the message (For 1-on-1 chats)
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // The actual text message contents
  text: { 
    type: String, 
    default: "" 
  },
  
  // Media configurations for images, videos, audio, etc.
  mediaUrl: { 
    type: String, 
    default: "" 
  },
  mediaType: { 
    type: String, 
    enum: ['none', 'image', 'video', 'audio', 'file'], 
    default: 'none' 
  },
  
  // Message delivery statuses (Like WhatsApp's single tick, double tick, blue tick)
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  
  // Optional: timestamps for exactly when a message was read
  readAt: {
    type: Date
  }
}, { timestamps: true });

// Indexing sender and receiver speeds up fetching chat histories drastically
MessageSchema.index({ sender: 1, receiver: 1 });

export const Message = mongoose.model('Message', MessageSchema);