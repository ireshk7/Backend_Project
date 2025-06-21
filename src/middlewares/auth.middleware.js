import { ApiError } from "../utits/ApiError.js";
import { asyncHandler } from "../utits/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"





// To logout the user we need verify the user,by access tokens

export const verifyJwt = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)              //can be verified by the person who has the secret key 
    
    
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")
    
        if(!user){
            //new class
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Acess token ")
    }
})
