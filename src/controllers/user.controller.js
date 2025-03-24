import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import jwt from "jsonwebtoken";

const generateAccessandRefressToken = async (userId) => {
  try {
    const user = await User.findById(userId); // The findById() method is used to find a document by its id. The user id is passed as an argument to the findById() method. The result is stored in the user variable.
    const accessToken = user.generateAccessToken(); // The generateAccessToken() method is used to generate an access token for the user. The generateAccessToken() method is called on the user object. The access token is stored in the accessToken variable.
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken; // The refreshToken field of the user object is set to the refresh token. The refresh token is stored in the refreshToken field of the user object.
    await user.save({ validateBeforeSave: false }); // The save() method is used to save the user object to the database. The validateBeforeSave option is set to false. The save() method returns a promise. The promise is awaited to save the user object to the database.
    // validateBeforeSave is false to skip schema validation when saving. If true, Mongoose validates all fields, potentially throwing errors if required fields or constraints are missing or invalid.
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refress token"
    );
  }
};

const userResister = asyncHandler(async (req, res) => {
  const { userName, email, password, fulName } = req.body;
  // check userfields are empty or not --------------------------------------------------

  // if (!userName || !email || !password || !fulName || !avatar) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Please provide all the required fields",
  //   });
  // }
  // ----------------/or/---------------------------
  if (
    [userName, email, password, fulName].some((field) => {
      // some() method is used to check if any of the fields are empty or null. If any of the fields are empty or null, then the some() method will return true. If all the fields are not empty or null, then the some() method will return false.
      return field?.trim() === ""; //  trim() method is used to remove any whitespace from the beginning and end of the string. If the field is empty or null, then the trim() method will return an empty string. If the field is not empty or null, then the trim() method will return the field itself.
    })
  ) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  // check user already exists or not -----------------------------
  const userExist = await User.findOne({
    // The findOne() method is used to find a single document in a collection.
    $or: [{ userName: userName }, { email: email }], // The conditions are specified as key-value pairs in the array. In this case, the conditions are the userName and email fields. The findOne() method returns the first document that matches any of the conditions.
  });

  if (userExist) {
    throw new ApiError(409, "User already exists");
  }

  // avtar and coverImg are required fields -----------------------------
  const avtarLocalpath = req.files?.avatar[0]?.path; // The req.files property is an object that contains the uploaded files. The avatar field is an array of files. The first file in the array is the file that was uploaded. The path property of the file object is the path to the file on the server. The path property is used to save the file to the server.
  // const coverImgLocalpath = req.files?.coverImg[0]?.path;
  let coverImgLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImg) &&
    req.files.coverImg.length > 0
  ) {
    coverImgLocalpath = req.files.coverImg[0].path; // The coverImg field is an array of files. The first file in the array is the file that was uploaded. The path property of the file object is the path to the file on the server. The path property is used to save the file to the server.
  }

  if (!avtarLocalpath) {
    throw new ApiError(
      400,
      "Please provide avtar image fields that is required"
    );
  }
  // upload files to cloudinary ------------------------------------
  const avatarCloudinary = await uploadOnCloudinary(avtarLocalpath); // The uploadOnCloudinary() function is used to upload the avatar file to Cloudinary. The avtarLocalpath is the path to the avatar file on the server. The uploadOnCloudinary() function returns the response from Cloudinary after uploading the file. The response contains the URL of the uploaded file.
  const coverImgCloudinary = await uploadOnCloudinary(coverImgLocalpath);

  if (!avatarCloudinary) {
    throw new ApiError(
      400,
      "Please provide avtar image fields that is required"
    );
  }

  // create user ------------------------------------

  const user = await User.create({
    // The create() method is used to create a new document in the collection. The create() method takes an object as an argument. The object contains the fields and values of the document to be created.
    fulName,
    email,
    userName: userName.toLowerCase(),
    password,
    avatar: avatarCloudinary.url,
    coverImg: coverImgCloudinary?.url || "",
  });

  // check user created or not ------------------------------------
  const createUser = await User.findById(user._id)
    .select // The findById() method is used to find a document by its id. The select() method is used to specify which fields to include or exclude in the result. In this case, the password and refreshToken fields are excluded from the result. The result is stored in the createUser variable.
    // "-password -refreshToken"
    ();
  if (!createUser) {
    throw new ApiError(500, "something went wrong while resistering the user");
  }

  // send response ------------------------------------
  return res.status(201).json(
    // The status() method is used to set the status code of the response. The json() method is used to send a JSON response to the client. The response contains the status code, the createUser object, and a success message.
    new ApiResponse(200, createUser, "User Resister Successfully") //
  );
});

const userLogin = asyncHandler(async (req, res) => {
  // req body -> data
  // check userfields are empty or not
  // check userName or email and password are not wrong
  // access and refresh token
  // send cookie

  // req body -> data ----------------------------
  const { userName, email, password } = req.body;

  // userName and email is required ---------------
  if (!(userName || email)) {
    throw new ApiError(400, "userName or email is required");
  }

  // find user is exist?  ---------------------------
  const user = await User.findOne({
    // The findOne() method is used to find a single document in a collection. The conditions are specified as key-value pairs in the object. In this case, the conditions are the userName and email fields. The findOne() method returns the first document that matches the conditions. The result is stored in the user variable.
    // $or: [{ userName }, { email }],
    $or: [{ userName: userName }, { email: email }],
  });

  if (!user) {
    throw new ApiError(404, "user des not exist");
  }

  // check password is correct or not -------------------------------
  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid credentials");
  }

  // generate access and refresh token -------------------------------

  const { accessToken, refreshToken } = await generateAccessandRefressToken(
    // The generateAccessandRefressToken() function is used to generate the access and refresh tokens for the user. The function takes the user id as an argument. The function returns an object containing the access and refresh tokens.
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookie -------------------------------

  const options = {
    // The options object contains the options for the cookie. The options object contains the following properties: maxAge, httpOnly, and secure. The maxAge property is set to 7 days. The httpOnly property is set to true. The secure property is set to true. The options object is used to set the options for the cookie.

    httpOnly: true, // The httpOnly property is set to true. The httpOnly property is used to prevent client-side JavaScript from accessing the cookie.

    secure: true, // The secure property is set to true. The secure property is used to ensure that the cookie is only sent over HTTPS.
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // The cookie() method is used to set a cookie in the response. The cookie() method takes three arguments: the name of the cookie, the value of the cookie, and the options for the cookie. In this case, the name of the cookie is accessToken, the value of the cookie is the access token, and the options for the cookie are specified in the options object. The cookie is set in the response.
    .cookie("refreshToken", refreshToken, options)
    .json({
      status: 200,
      data: {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      message: "User logIn successfully",
    });
});

const userLogout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    // findByIdAndUpdate() method is used to find a document by its id and update it. The findByIdAndUpdate() method takes three arguments: the id of the document to update, the update object, and the options object. In this case, the id of the document to update is the id of the user. The update object is used to update the refreshToken field of the user object. The refreshToken field is set to undefined. The options object is used to specify the options for the update operation.
    req.user._id,
    {
      $set: { refreshToken: undefined }, // set method is used to update a particular field in the document. The refreshToken field of the user object is set to undefined. The refreshToken field is used to store the refresh token of the user. The refresh token is set to undefined to remove the refresh token from the user object.
    },
    {
      new: true, // The new option is set to true. The new option is used to return the updated document. The updated document is stored in the user variable. The updated document contains the fields and values of the user object after the update operation.
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({
      status: 200,
      data: {},
      message: "Now You logOut! Please login again",
    });
});

const refresnAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; // The incomingRefreshToken variable is used to store the refresh token. The refresh token is stored in the cookies. The refresh token is stored in the cookies because the refresh token is used to generate the access token. The refresh token is used to generate the access token because the access token is used to authenticate the user.
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      // The decodedToken variable is used to store the decoded token. The decoded token is used to verify the refresh token. The decoded token is used to verify the refresh token because the refresh token is used to generate the access token.
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log(decodedToken);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    console.log(user);
    // check refresh token is valid or not
    if ( incomingRefreshToken!== user?.refreshToken ) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // generate new access token and refresh token and send cookie to client side ------------------------------------
    const options = { 
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessandRefressToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
export { userResister, userLogin, userLogout, refresnAccessToken };
