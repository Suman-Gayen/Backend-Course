// require("dotenv").config();
// import mongoose from "mongoose";
// import {DATABASE_NAME} from "./constant.js";  
import connectDB from "./db/index.db.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({
    path: './env' // path to the .env file 
})




connectDB()
.then(()=>{
    console.log("MongoDB Connected");



    app.on("error", (error)=>{
        console.log("Error: ", error);
        throw error;
    })
    app.listen(process.env.PORT || 3000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });

})
.catch((err)=>{
    console.log("MongoDB connection error: ", err);
})








































/*
import express from "express";
const app = express();

(
    async ()=>{
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/${DATABASE_NAME}`)
            app.on("error",(error)=>{
                console.log("Error connecting to the database: ", error)
                throw error;
            });
            app.listen(process.env.PORT || 3000, ()=>{
                console.log(`Server is running on port ${process.env.PORT}`);
            });
        }   catch (error) {
            console.log("Error: ", error);
            throw error; 
        }
    }
)()
*/