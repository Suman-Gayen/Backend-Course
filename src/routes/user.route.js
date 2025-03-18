import { Router } from "express";
import userResister  from "../controllers/user.controller.js";

const userRoute = Router( )
userRoute.route("/resister").post(userResister)
export default userRoute;
