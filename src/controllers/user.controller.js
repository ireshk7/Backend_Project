import { asyncHandler } from "../utits/asyncHandler.js";
import {ApiError}   from "../utits/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utits/cloudinary.js";
import { ApiResponse } from "../utits/ApiResponse.js";

const registerUser = asyncHandler(async (req,res)=>{
    // get user details from frontend
    const {fullName,email,username,password}= req.body
    // console.log("email",email)
    //validation - not empty 

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim() === ""
        )
    ){
        throw new ApiError(400,"All fields are Required")
    }
    // check is user already exists :e username,email
    const existingUser = await User.findOne({ 
        $or:[{ username },{ email }]
    })
    console.log(existingUser)

    if(existingUser){
        throw new ApiError(409,"User with email and Username already exists")
    }
    // check for images , check for avatar 
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; this gives error for not sending


    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) &&  req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path 
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar Required ")
    }
    // upload them to cloudinaty, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar Required ")
    }
    // check user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || " ",
        email,
        password,
        username:username.toLowerCase()
    })
    // remove password and refresh token field from response 

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check for user creation 
    if(!createdUser){
        throw new ApiError(500,"Something went wrong registering the user ")
    }

    // chech for user creation 
    // return res 

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully")
    )
})


export {registerUser}
