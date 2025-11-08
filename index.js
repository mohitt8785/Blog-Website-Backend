import express from "express";
import dotenv from "dotenv";
import connectDB from "./connect.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";

//Routes Imports
import userRouter from "./routes/user.route.js"
import blogRouter from "./routes/blog.route.js"

dotenv.config({
  path: "./.env"
});

// console.log(process.env)
const Port = process.env.PORT || 3001;
const corsOptions = {
  origin: process.env.FRONTEND_URI,
  optionsSuccessStatus: 200,
  credentials: true,
}

connectDB();

const app = express();

// Serve static files from /uploads
app.use('/uploads', express.static(path.join('uploads')));

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/api/v1/user", userRouter);
app.use("/api/v1/blogs", blogRouter)


app.listen(Port, () => {
  console.log(`Server Started at http://localhost:${Port}`)
})