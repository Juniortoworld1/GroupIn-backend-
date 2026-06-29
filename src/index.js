import dotenv from 'dotenv'
// 1. Initialize dotenv immediately right after importing it
dotenv.config() 

// 2. Now it is completely safe to import app and your database
import { connectDB } from './database/index.database.js'
import { app } from "./app.js"

const PORT = process.env.PORT || 4000;
console.log("Checking API Key:", process.env.CLOUDINARY_API); // This will now print your key!

connectDB()
.then(() => {
    const server = app.listen(PORT, () => {
        console.log(`\n\nServer is running at port : ${PORT}`);
    });

    server.on("error", (error) => {
        console.log(`Server error: ${error}`);
    });
})
.catch((error) => {
    console.log("\n\nMongoDB connection failed !!!", error);
});