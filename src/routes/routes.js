
import { Router } from "express";
import { registerUser } from "../controllers/register.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { login } from "../controllers/login.controllers.js";
import { logOut } from "../controllers/logout.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

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

export default route
