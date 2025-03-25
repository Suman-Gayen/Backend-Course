import { Router } from "express";
import {
  userResister,
  userLogin,
  userLogout,
  refresnAccessToken,
  changePassword,
  getCurreuntUser,
  updateUserProfile,
  updateAvatar,
  updateCoverImg,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middle.js";
import { verifyJWT } from "../middlewares/auth.middle.js";

const userRoute = Router();

userRoute.route("/resister").post(
  upload.fields([
    // The upload.fields() method is used to upload multiple files. It takes an array of objects, where each object has two properties: name and maxCount. The name property is used to define the name of the input field associated with the file. The maxCount property is used to define the maximum number of files that can be uploaded. In this case, only one file can be uploaded for each input field.
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImg",
      maxCount: 1,
    },
  ]),
  userResister
);
userRoute.route("/login").post(userLogin);

userRoute.route("/logout").post(verifyJWT, userLogout);

userRoute.route("/refresh-token").post(refresnAccessToken);

userRoute.route("/change-password").post(verifyJWT, changePassword);

userRoute.route("/me").get(verifyJWT, getCurreuntUser);

userRoute.route("/update-profile").patch(verifyJWT, updateUserProfile);

userRoute.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);

userRoute.route("/update-coverImg").patch(verifyJWT, upload.single("coverImg"), updateCoverImg);

userRoute.route("/c/:username").get(verifyJWT, getUserChannelProfile);

userRoute.route("/history").get(verifyJWT, getWatchHistory);

export default userRoute;
