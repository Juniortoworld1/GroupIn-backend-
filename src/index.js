import dotenv from 'dotenv'
import { connectDB } from './database/index.database.js'
import { app } from "./app.js"

dotenv.config()

const PORT = process.env.PORT || 4000;

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