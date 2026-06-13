import mongoose from "mongoose";
import { DATABASENAME } from "../constants.js";

export const connectDB = async () =>{
    try {
        console.log(`the database is : ${process.env.MONGODB_URI}`)
        const connects = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n\n MongoDb connected !! DB host: ${connects.connection.host}`)

    }catch(error){
        console.log("getting error of " , error)
        process.exit(1)

    }
}