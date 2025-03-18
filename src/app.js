import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // allow to server to accept request from different origin
    credentials: true, // allow session cookie from browser to pass through
  })
);
app.use(express.json({ limit: "16kb" })); // parse incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // parse incoming requests with urlencoded payloads
app.use(express.static("public")); // serve static files from the public folder

app.use(cookieParser()); // parse cookies attached to the client request object

//routes import
import userRoute from "./routes/user.route.js"; // rotes declaration

// rotes declaration

app.use("/api/v1/user", userRoute);

export default app;
