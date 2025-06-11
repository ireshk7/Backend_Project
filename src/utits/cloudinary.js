import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({ 

        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET// Click 'View API Keys' above to copy your API secret
});



const uploadOnCloudinary = async (localStorage)=>{
    try{
        if(!localStorage) return null
        //upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localStorage,{
            resource_type:"image"
        })
        // file has been Uploaded successfully
        // console.log("file is uploaded on cloudnary",response.url);
        fs.unlinkSync(localStorage);  //Unlinking so that we can delete the files from the local storage 

        return response;

    }catch(error) {
        await fs.unlink(localStorage).catch(()=>{}); //remove the locally stored temp file as the upload operation got failed
        return null;
    }
}


// const uploadOnCloudinary = async (localStoragePath) => {
//   try {
//     if (!localStoragePath) return null;

//     // Normalize the path for cross-platform compatibility
//     const normalizedPath = path.resolve(localStoragePath);

//     const response = await cloudinary.uploader.upload(normalizedPath, {
//       resource_type: "image",
//     });

//     console.log("File uploaded to Cloudinary:", response.url);
//     return response;
//   } catch (error) {
//     console.error("Cloudinary upload error:", error.message);

//     try {
//       await fs.unlink(path.resolve(localStoragePath));
//     } catch (err) {
//       console.error("Failed to delete local file:", err.message);
//     }

//     return null;
//   }
// };




export {uploadOnCloudinary}