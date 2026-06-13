import dotenv from 'dotenv'
import { connectDB } from './database/index.database.js'
import {app} from "./app.js"


dotenv.config()

connectDB()
.then(()=>{
    app.listen(()=>{
        try {
            app.listen(process.env.PORT||4000 , ()=>{
                console.log(`\n\nserver is running at port : ${process.env.PORT||4000}`)
            })
        } catch (error) {
            console.log(`Getting error in index.js : ${error}`)
            
        }
    })
})
.catch((error)=>{
    console.log("\n\n Mongodb connection failed !!!")
})
