import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"



const userSchema = new Schema(
    
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trip:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trip:true,
        },
        fullName:{
            type:String,
            required:true,
            trim:true,
        },
        avatar:{
            type:String, //cloudinary url
            required:true
        },
        coverImage:{
            type:String, // cloudnary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password:{
            type:String,
            required:[true,'Password is Required']
        },
        refreshToken:{
            type:String,
        }
    }
,{timestamps:true})


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
        
    this.password = bcrypt.hash(this.password,10)
    next()

})

userSchema.methods.isPasswordCorrect = async function(password){
    return  await bcrypt.compare(password,this.password)
}


userSchema,methods.generateAccessToken = async function(){
    jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = async function(){
    jwt.sign(
        {
            _id :this._id,
            username:this.username,
            email:this.email,
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",userSchema)