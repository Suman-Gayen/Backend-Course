import mongoose from "mongoose";
import {DATABASE_NAME} from "./constant.js";










/*
import express from "express";
const app = express();

{ async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DATABASE_NAME}`)
        app.on("error",(error)=>{
            console.log("Error connecting to the database: ", error)
            throw error;
        });
        app.listen(process.env.PORT || 3000, ()=>{
            console.log(`Server is running on port ${process.env.PORT`});
        });
    } catch (error) {
        console.log("Error: ", error);
        throw error; // throw error to stop the application from running if there is an error connecting to the database 
    }
}}{} 
    */