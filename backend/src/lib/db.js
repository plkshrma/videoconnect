import mongoose from "mongoose"

import {ENV} from "./env.js"

export const connectDB = async() =>{
    try{
        if(!ENV.DB_URL){
            throw new Error("DB_URL is not definedin environment variables");
        }
        const conn = await mongoose.connect(ENV.DB_URL)
        console.log("connected to mongoDB:",conn.connection.host)
    }catch (error){
        console.error("error connecting to mongoDB",error)
        process.exit(1); 

    }
};