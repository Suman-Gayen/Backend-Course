import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // File system module to read files from the file system in Node.js environment. It is used to read the file from the file system and upload it to Cloudinary.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect the type of the file and upload it.
    });
    console.log("File Uploded Successfully", response.url);
    return response;
  } catch (error) {
    fs.unwatchFile(localFilePath); // Unwatch the file after uploading it to Cloudinary to avoid memory leaks.
    console.error("Error in Uploading File", error);
    return null;
  }
};
