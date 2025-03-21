import connectDB from "./db/index.db.js";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ // The dotenv.config() method is used to load the environment variables from the .env file into the process.env object. The .env file contains the environment variables that are used by the application. The dotenv.config() method is called at the beginning of the application to load the environment variables. 
    path: './.env' // path to the .env file 
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