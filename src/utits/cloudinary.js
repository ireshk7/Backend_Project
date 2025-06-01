import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 

        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});



const uploadOnCloudinary = async (localStorage)=>{
    try{
        if(!localStorage) return null
        //upload the file on Cloudinary
        cloudinary.uploader.upload(localStorage,{
            resource_type:"image"
        })
        // file has been Uploaded successfully
        console.log("file is uploaded on cloudnary",response.url);
        return response;

    }catch(error) {
        fs.unlink(localStorage) //remove the locally stored temp file as the upload operation got failed
        return null;
    }
}