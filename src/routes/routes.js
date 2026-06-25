
import { Router } from "express";
import { registerUser } from "../controllers/register.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { login } from "../controllers/login.controllers.js";
import { logOut } from "../controllers/logout.controlles.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, rejectFriendRequest, sendFriendRequest } from "../controllers/friendRequest.controller.js";
import { message, readMessageSendByFriend, readMessageSendUs } from "../controllers/message.controller.js";
import { comments, likes, post } from "../controllers/post.controllers.js";
import { getHomePageFeed } from "../controllers/feed.controllers.js";


const route = Router() ; 

route.route("/register").post(
    upload.fields([
        {
            name:"avatar" , 
            maxCount:1
        } , 
        {
            name:"coverImage" , 
            maxCount:1
        } 
    ]) , 

    registerUser
)

route.route("/login").post(
    login
)

route.route("/logout").post(
    verifyJWT , 
    logOut
)


route.route("/friendrequest/send").post(
    verifyJWT , 
    sendFriendRequest
) 

route.route("/friendrequest/receive").post(
    verifyJWT, 
    acceptFriendRequest
)

route.route("/friendrequest/delete").post(
    verifyJWT , 
    rejectFriendRequest
)

route.route("/message").post(
    upload.fields([
        {
            name:"messagePic", 
            maxCount : 1
        }
    ]) , 
    verifyJWT, 
    message
)

route.route("/message/incomming").post(
    verifyJWT , 
    readMessageSendByFriend
)

route.route("/message/outgoing").post(
    verifyJWT , 
    readMessageSendUs
)

route.route("/post").post(
    verifyJWT , 
    upload.fields([
        {
            name:"postImg", 
            maxCount : 3
        }
    ]) , 
    post
)

route.route("/post/like").post(
    verifyJWT , 
    likes
)

route.route("/post/comment").post(
    verifyJWT , 
    comments
)

route.route("/feed").get(
    getHomePageFeed
)

export default route
