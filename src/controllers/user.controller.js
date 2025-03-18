import asyncHandler from "../utils/asyncHandler.utils.js";

const userResister = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "OK",
  });
});



export default userResister;