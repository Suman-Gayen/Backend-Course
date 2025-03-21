import asyncHandler from "../utils/asyncHandler.utils.js";
import {ApiError} from "../utils/apiError.utils.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.utils.js";  
import { ApiResponse } from "../utils/apiResponse.utils.js";


const userResister = asyncHandler(async (req, res) => {
  const { userName, email, password, fulName } = req.body;
  // console.log(userName, email, password, fulName, avatar, coverImg );
  console.log(req.body);
  console.log(req.files);
  // check userfields are empty or not --------------------------------------------------

  // if (!userName || !email || !password || !fulName || !avatar) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Please provide all the required fields",
  //   });
  // }
  // ----------------/or/---------------------------
  if (
    [userName, email, password, fulName ].some((field=>{   // some() method is used to check if any of the fields are empty or null. If any of the fields are empty or null, then the some() method will return true. If all the fields are not empty or null, then the some() method will return false.
      return field?.trim() === ""; //  trim() method is used to remove any whitespace from the beginning and end of the string. If the field is empty or null, then the trim() method will return an empty string. If the field is not empty or null, then the trim() method will return the field itself. 
    }))
  ) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  // check user already exists or not -----------------------------

  const userExist = await User.findOne({ // The findOne() method is used to find a single document in a collection.
    $or: [{ userName: userName }, { email: email }] // The conditions are specified as key-value pairs in the array. In this case, the conditions are the userName and email fields. The findOne() method returns the first document that matches any of the conditions.
  })

  // console.log(userExist);
  if(userExist){
    throw new ApiError(409, "User already exists");
  }

  // avtar and coverImg are required fields -----------------------------

  console.log(req.files);
  const avtarLocalpath = req.files?.avatar[0]?.path; // The req.files property is an object that contains the uploaded files. The avatar field is an array of files. The first file in the array is the file that was uploaded. The path property of the file object is the path to the file on the server. The path property is used to save the file to the server. 
  // const coverImgLocalpath = req.files?.coverImg[0]?.path;
  let coverImgLocalpath;
  if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) { 
    coverImgLocalpath = req.files.coverImg[0].path;    // The coverImg field is an array of files. The first file in the array is the file that was uploaded. The path property of the file object is the path to the file on the server. The path property is used to save the file to the server. 
  }

  if (!avtarLocalpath ) {
    throw new ApiError(400, "Please provide avtar image fields that is required");
  }
  console.log(avtarLocalpath);

  // upload files to cloudinary ------------------------------------
  const avatarCloudinary = await uploadOnCloudinary(avtarLocalpath); // The uploadOnCloudinary() function is used to upload the avatar file to Cloudinary. The avtarLocalpath is the path to the avatar file on the server. The uploadOnCloudinary() function returns the response from Cloudinary after uploading the file. The response contains the URL of the uploaded file. 
  const coverImgCloudinary = await uploadOnCloudinary(coverImgLocalpath); 

  if (!avatarCloudinary) {
    throw new ApiError(400, "Please provide avtar image fields that is required");
  }

  // create user ------------------------------------

  const user = await User.create({ // The create() method is used to create a new document in the collection. The create() method takes an object as an argument. The object contains the fields and values of the document to be created.
    fulName,
    email,
    userName: userName.toLowerCase(),
    password,
    avatar: avatarCloudinary.url,
    coverImg: coverImgCloudinary?.url || ""
  })

  // check user created or not ------------------------------------
  const createUser = await User.findById(user._id).select( // The findById() method is used to find a document by its id. The select() method is used to specify which fields to include or exclude in the result. In this case, the password and refreshToken fields are excluded from the result. The result is stored in the createUser variable. 
    // "-password -refreshToken"
  )
  if (!createUser) {
    throw new ApiError(500, "something went wrong while resistering the user")
    
  }

  // send response ------------------------------------
  return res.status(201).json( // The status() method is used to set the status code of the response. The json() method is used to send a JSON response to the client. The response contains the status code, the createUser object, and a success message.
    new ApiResponse(200, createUser, "User Resister Successfully") //
  )

});




export default userResister;