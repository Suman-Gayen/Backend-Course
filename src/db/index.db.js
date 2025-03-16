import mongoose from "mongoose";
// import {DATABASE_NAME} from "../constant.js";


const connectDB = async () =>{
    try {
        const response = await mongoose.connect(`${process.env.MONGO_URI}`,)
        console.log(`MongoDB connected to ${response.connection.host}`);
    } catch (error) {
        console.log("Error connecting to the database: ", error)
        process.exit(1); //  exit the process if there is an error connecting to the database 
    }
}


export default connectDB;