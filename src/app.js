import express from "express" 
import cors from 'cors'
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin: "*",
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import route from "./routes/routes.js"

app.use("/groupin/api/v1/users" , route)


export {app}
