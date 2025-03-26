import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/apiError.utils.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.utils.js";
import { ApiResponse } from "../utils/apiResponse.utils.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
  const avatarLocalpath = req.files?.avatar[0]?.path; // The req.files property is an object that contains the uploaded files. The avatar field is an array of files. The first file in the array is the file that was uploaded. The path property of the file object is the path to the file on the server. The path property is used to save the file to the server.

  let coverImgLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImg) &&
    req.files.coverImg.length > 0
  ) {
    coverImgLocalpath = req.files.coverImg[0].path; // The coverImg field is an array of files. The first file in the array is the file that was uploaded. The path property of the file object is the path to the file on the server. The path property is used to save the file to the server.
  }

  if (!avatarLocalpath) {
    throw new ApiError(
      400,
      "Please provide avtar image fields that is required"
    );
  }
  // upload files to cloudinary ------------------------------------
  const avatarCloudinary = await uploadOnCloudinary(avatarLocalpath); // The uploadOnCloudinary() function is used to upload the avatar file to Cloudinary. The coverImgLocalpath is the path to the avatar file on the server. The uploadOnCloudinary() function returns the response from Cloudinary after uploading the file. The response contains the URL of the uploaded file.
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
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // The findById() method is used to find a document by its id. The select() method is used to specify which fields to include or exclude in the result. In this case, the password and refreshToken fields are excluded from the result. The result is stored in the createUser variable.
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken; // The incomingRefreshToken variable is used to store the refresh token. The refresh token is stored in the cookies. The refresh token is stored in the cookies because the refresh token is used to generate the access token. The refresh token is used to generate the access token because the access token is used to authenticate the user.
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  console.log(incomingRefreshToken);
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
    if (incomingRefreshToken !== user?.refreshToken) {
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
    throw new ApiError(404, error?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordMatched = await user.comparePassword(oldPassword);
  if (!isPasswordMatched) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword; // The password field of the user object is set to the new password. The new password is the password entered by the user. The password field is used to store the password of the user. The password is stored in the database in hashed form. The password is hashed using the bcrypt library.
  await user.save({ validateBeforeSave: false }); // The save() method is used to save the user object to the database. The validateBeforeSave option is set to false. The save() method returns a promise. The promise is awaited to save the user object to the database. The validateBeforeSave is false to skip schema validation when saving. If true, Mongoose validates all fields, potentially throwing errors if required fields or constraints are missing or invalid.
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurreuntUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current User found Successfuly"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { fulName, email, userName } = req.body;

  if (!fulName || !email || !userName) {
    throw new ApiError(400, "Please provide all the required fields");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        // The $set operator is used to update the fields of the document.
        fulName,
        email,
        userName,
      },
    },
    {
      new: true, // The new option is set to true. The new option is used to return the updated document. The updated document is stored in the user variable. The updated document contains the fields and values of the user object after the update operation.
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalpath = req.file?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, " Avtar file is missing ");
  }
  const avatar = await uploadOnCloudinary(avatarLocalpath);
  if (!avatar.url) {
    throw new ApiError(400, " Error while uploading on avatar ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select(" -password ");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated successfully"));
});

const updateCoverImg = asyncHandler(async (req, res) => {
  const coverImgLocalpath = req.file?.path;

  if (!coverImgLocalpath) {
    throw new ApiError(400, " Avtar file is missing ");
  }
  const coverImg = await uploadOnCloudinary(coverImgLocalpath);
  if (!coverImg.url) {
    throw new ApiError(400, " Error while uploading on coverImg ");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImg: coverImg.url,
      },
    },
    {
      new: true,
    }
  ).select(" -password ");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImg updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params; // The username variable is used to store the username of the channel. The username is passed as a parameter in the URL. The username is used to find the channel in the database. The username is used to find the channel in the database because the username is unique for each channel.
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }
  const channel = await User.aggregate([
    // The aggregate() method is used to perform aggregation operations on the collection. The aggregate() method takes an array of stages as an argument. The stages are used to perform different operations on the documents. In this case, the stages are used to filter, join, and add fields to the documents. The result is stored in the channel variable.
    {
      $match: {
        // The match stage is used to filter the documents. The match stage takes an object as an argument. The object contains the conditions to filter the documents.
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        // The lookup stage is used to join collections. The lookup stage takes an object as an argument. The object contains the fields to join the collections.
        from: "subscriptions", // The from field is used to specify the collection to join. In this case, the from field is set to subscriptions. The subscriptions collection is joined with the users collection.
        localField: "_id", // The localField field is used to specify the field in the users collection to join with the subscriptions collection. In this case, the localField field is set to _id. The _id field of the users collection is joined with the subscriber field of the subscriptions collection.
        foreignField: "channel", // The foreignField field is used to specify the field in the subscriptions collection to join with the users collection. In this case, the foreignField field is set to channel. The channel field of the subscriptions collection is joined with the _id field of the users collection.
        as: "subscribers", // The as field is used to specify the name of the field to store the joined documents. In this case, the as field is set to subscribers. The joined documents are stored in the subscribers field of the users collection.
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        // The addFields stage is used to add new fields to the documents. The addFields stage takes an object as an argument. The object contains the fields to add to the documents.
        subscribersCount: {
          $size: "$subscribers", // The $size operator is used to get the size of an array. The $size operator takes the field as an argument. In this case, the field is the subscribers field of the users collection. The size of the subscribers array is stored in the subscribersCount field of the users collection.
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            // The $cond operator is used to conditionally return a value. The $cond operator takes an object as an argument. The object contains the conditions and values to return.
            if: { $in: [req.user?._id, "$subscribers.subscriber"] }, // The $in operator is used to check if a value is in an array. The $in operator takes two arguments: the value to check and the array to check against. In this case, the value to check is the user id of the logged-in user. The array to check against is the subscribers array of the users collection. The $in operator returns true if the value is in the array, otherwise it returns false. The result is stored in the isSubscribed field of the users collection.
            then: true, // The then field is used to specify the value to return if the condition is true. In this case, the then field is set to true. The value true is returned if the user is subscribed to the channel.
            else: false, // The else field is used to specify the value to return if the condition is false. In this case, the else field is set to false. The value false is returned if the user is not subscribed to the channel.
          },
        },
      },
    },
    {
      $project: {
        // The project stage is used to include or exclude fields from the documents. The project stage takes an object as an argument. The object contains the fields to include or exclude.
        fulName: 1,
        username: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImg: 1,
      },
    },
  ]);
  console.log(channel);

  if (!channel.length) {
    throw new ApiError(401, "channel does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel fatched sccessfuly"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // The match stage is used to filter the documents. The match stage takes an object as an argument. The object contains the conditions to filter the documents. In this case, the condition is the _id field of the users collection. The _id field is used to find the user by id. The id is passed as a parameter in the URL. The id is used to find the user in the database.
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          // The pipeline field is used to specify the stages of the aggregation pipeline. The stages are used to perform different operations on the documents. In this case, the stages are used to filter, join, and add fields to the documents. The result is stored in the watchHistory field of the users collection.
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fulName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              // The addFields stage is used to add new fields to the documents. The addFields stage takes an object as an argument. The object contains the fields to add to the documents.
              owner: {
                $first: "$owner", // The $first operator is used to get the first element of an array. The $first operator takes the field as an argument. In this case, the field is the owner field of the videos collection. The first element of the owner array is stored in the owner field of the videos collection.
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fatched sccessfuly"
      )
    );
});

export {
  userResister,
  userLogin,
  userLogout,
  refreshAccessToken,
  changePassword,
  getCurreuntUser,
  updateUserProfile,
  updateAvatar,
  updateCoverImg,
  getUserChannelProfile,
  getWatchHistory,
};
