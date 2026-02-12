import mongoose from "mongoose";
import express from "express"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import cors from "cors"

//import routes
import contactRoutes from "./Routes/contactRoutes.js"
import userRoutes from "./Routes/userRoutes.js"

dotenv.config()
const mongourl = process.env.Mongo_Url;

mongoose.connect(mongourl).then(() => {
    console.log("connected to db")
}).catch((err) => {
    console.log("Erro conected db"+err)
}
)

let app = express();

app.use(cors())

app.use((req, res, next) => {
    const authorizationHeader = req.header("Authorization");
   
   if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")
        console.log("Authorization Token:", token);

         jwt.verify(token, process.env.JWT_SECRET, (error, content) => {
           if(error){
            console.log("Invalid token:", error.message);
           } else if(content){
            console.log("Token content:", content);
            req.user = content;
           }
        })
    }
    next();
});


app.use(express.json())

//routes

app.use("/api/users", userRoutes)
app.use("/api/contact", contactRoutes)

app.listen(3000, () => {
    console.log("server started at port 3000")
})
