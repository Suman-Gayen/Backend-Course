import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fulName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudnary url
      required: true,
    },
    coverImg: {
      type: String, // cloudnary url
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: "video",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // this is a middleware that runs before the save method is called on the user model. It is used to hash the password before saving it to the database.
  if (!this.isModified("password")) return next(); // if the password is not modified, then move to the next middleware or function in the chain of execution.
  this.password = await bcrypt.hash(this.password, 10); // 10 is the number of rounds to generate the salt. The higher the number, the more secure the password will be. The default is 10.
  next(); // this is important to move to the next middleware or function in the chain of execution. It allows the code to continue executing the rest of the code after the current middleware or function has finished its execution.
});

userSchema.method.isValidPassord = async function (password) {
  return await bcrypt.compare(password, this.password); // this method is used to compare the password entered by the user with the hashed password stored in the database. It returns a boolean value.
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    // this method is used to generate an access token for the user. It takes the user's id, email, username, and full name as the payload and the access token secret as the secret key. It also specifies the expiry time of the access token. The expiry time is set in the .env file. The access token is used to authenticate the user's requests to the server.  The access token is stored in the client's local storage or session storage. The access token is used to authenticate the user's requests to the server.  The access token is stored in the client's local storage or session storage.
    {
      _id: this._id, // the user's id is used as the payload of the access token. It is used to identify the user.
      email: this.email, // the user's email is used as the payload of the access token. It is used to identify the user.
      userName: this.userName,
      fulName: this.fulName,
    },
    process.env.ACCESS_TOKEN_SECRET, // the access token secret is used as the secret key to generate the access token. It is stored in the .env file
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // the expiry time of the access token is set in the .env file. It is used to specify the time after which the access token will expire. The default is 15 minutes.
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    // this method is used to generate a refresh token for the user. It takes the user's id as the payload and the refresh token secret as the secret key. It also specifies the expiry time of the refresh token. The expiry time is set in the .env file. The refresh token is used to generate a new access token when the access token expires. The refresh token is stored in the database. The refresh token is used to authenticate the user's requests to the server.
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY, // the expiry time of the refresh token is set in the .env file. It is used to specify the time after which the refresh token will expire. The default is 1 day.
  });
};

export const User = mongoose.model("user", userSchema);
