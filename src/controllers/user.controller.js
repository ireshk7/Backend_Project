import { asyncHandler } from "../utits/asyncHandler.js";
import {ApiError}   from "../utits/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utits/cloudinary.js";
import { ApiResponse } from "../utits/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // put refresh token in database 

        user.refreshToken = refreshToken // put in database 
        await user.save({validateBeforeSave:false})                           // save and validateBeforeSave cause it doesnt kick in password or require password to verify the user
        return {accessToken,refreshToken}        

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
        
    }
}

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


const loginUser = asyncHandler(async(req,res)=>{

    //req body -> data
    // username or email 
    // find the user
    // password check
    // access and refresh token 
    // send cookies (secure)
    // response success 

    const {email,username,password} = req.body 

    if(!(username || email) ){
        throw new ApiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user Credentials");

    }
    // generating Access and refresh token Method is written above as it maybe used many times 

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //cookies
    const options = {
        httpOnly:true,//httpOnlt and secure helps in securing and not allowing  user to modifycookies 
        secure:true   // can only modified by Server.

    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,refreshToken      //sending token so that user can save it 
            },
            "User loggedd In Successfully"
        )
    )
})

// made an Middleware  so that user is already autenticated!!! 
const logoutUser = asyncHandler(async(req,res)=>{
    // remove or clear cookies
    // remove refreshToken from dataBase 
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            },
        },
        {
            new:true    // when returning responce it return the new updated db 
        }
        
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))

})



export {registerUser,
        loginUser,
        logoutUser
}
