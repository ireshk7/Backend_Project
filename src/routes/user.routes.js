import express from "express";
import { loginUser, logoutUser, registerUser,refreshAccessToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const router = express.Router()
import { verifyJwt } from "../middlewares/auth.middleware.js";

router.post("/register",
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)


// router.route("/login").post(loginUser) this can be used 

router.post("/login",loginUser)



//secured routes
router.post("/logout",verifyJwt,logoutUser)

router.post("/refresh-token",refreshAccessToken)
export default router; 