import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        const response = await mongoose.connect(`${process.env.MONGO_URI}`,) // connect to the database using the MONGO_URI from the .env file 
        console.log(`MongoDB connected to ${response.connection.host}`); // log the host of the database to the console 
    } catch (error) {
        console.log("Error connecting to the database: ", error)
        process.exit(1); //  exit the process if there is an error connecting to the database 
    }
}


export default connectDB;