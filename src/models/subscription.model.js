import mongoose,{Schema} from "mongoose";

const subcriptionSchema = new Schema({
    subcriber:{
        type:Schema.Types.ObjectId, // one who is Subcribing.
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,    // one to whom 'Subscriber' is Subcribing
        ref:"User"

    }
},{timestamps:true})



export const Subcription = mongoose.model("Subcription ", subcriptionSchema)