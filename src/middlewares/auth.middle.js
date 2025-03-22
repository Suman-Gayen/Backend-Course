
import {apiError} from '../utils/apiError';
import asyncHandler from 'utils/asyncHandler';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const verifyJWT = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", ""); // get the token from the request header or cookie if it exists. The token is usually sent in the Authorization header as a Bearer token. The Bearer token is a type of access token that is sent along with the request to authenticate the user. The token is used to verify the identity of the user and grant access to the requested resource. 
    
        if (!token) {
            throw apiError(401, "Unauthorized requist");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // verify the token using the secret key. The secret key is stored in the .env file. The secret key is used to verify the token and decode the payload. The payload contains the user's id, email, username, and full name. 
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken"); // find the user by id in the database. The id is extracted from the decoded token. The password and refresh token are excluded from the user object. The password and refresh token are sensitive information that should not be exposed to the client. 
    
        if (!user) {
            throw apiError(401, "Invalid access token");
        }
        req.user = user; // set the user object in the request object. The user object is used to authenticate the user's requests to the server. The user object contains the user's id, email, username, and full name. 
        next(); // move to the next middleware or function in the chain of execution after the current middleware has finished its execution. 
    } catch (error) {
        throw new apiError(401, error?.message|| "Invalid access token");
    }
});