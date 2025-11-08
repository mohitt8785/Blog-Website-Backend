import mongoose from "mongoose"
import { DB } from "./constants.js"

let connectDB = () => mongoose.connect(`${process.env.MONGODB_URI}/${DB}`)
.then(()=>{
    console.log("MongoDB Connected")
})
.catch((error)=>{
    console.log(error)
})

export default connectDB;