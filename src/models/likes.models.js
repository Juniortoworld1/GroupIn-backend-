import mongoose, { mongo } from "mongoose";

const likeSchema = mongoose.Schema({
    senderId :{
        type: mongoose.Schema.Types.ObjectId , 
        ref : "User" , 
        required: true  
    } , 
    postOwner : {
        type:mongoose.Schema.Types.ObjectId , 
        ref : "User" , 
        required : true 
    } , 
    postId : {
        type:mongoose.Schema.Types.ObjectId , 
        ref:"Post"
    } , 
    

}) ; 

export const Likes = mongoose.model("Like" , likeSchema)