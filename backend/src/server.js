// import express from "express";
// import path from "path";
// import cors from "cors";
// import {serve} from "inngest/express"

// import { ENV } from "./lib/env.js";
// import { connectDB } from "./lib/db.js";
// import { inngest,functions } from "./lib/inngest.js";

// const app = express();

// const __dirname = path.resolve()

// app.use(express.json())
// app.use(cors({origin:ENV.CLIENT_URL,credentials:true}))


// app.use("/api/inngest",serve({client:inngest,functions }))
// app.get("/health",(req, res) =>{
//     res.status(200).json({msg:"api is up and running "})

// });

// app.get("/books",(req, res) =>{
//     res.status(200).json({msg:"books endpoint "})

// });
// // make our app ready for deployment 
// if(ENV.NODE_ENV === "production"){
//     app.use(express.static(path.join(__dirname,"../frontend/dist")));

//     app.get("/{*any}", (req,res) =>{
//         res.sendFile(path.join(__dirname,"../frontend", "dist","index.html"));
//     });
// }



// const startServer = async () =>{
//     try{
//         await connectDB();
//         app.listen(ENV.PORT, () => console.log("server is running on port:",ENV.PORT));
        
// }catch (error) {
//     console.error("Error starting the server", error)
// }
// };
// startServer();


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

async function start() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected");

    app.use("/api/inngest", serve({ client: inngest, functions }));

    app.listen(3000, () => {
      console.log("✅ Server running on port 3000");
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

start();
