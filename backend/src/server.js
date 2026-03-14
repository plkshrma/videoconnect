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
import { createServer } from "http";
import { Server } from "socket.io";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || process.env.NODE_ENV === 'production'
      ? ["https://your-frontend-domain.vercel.app", "https://your-frontend-domain.netlify.app"]
      : ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5179", "http://localhost:5180"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));

// Socket.io for video calling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    // Handle user disconnect
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });

    // WebRTC signaling
    socket.on('offer', (payload) => {
      socket.to(roomId).emit('offer', payload);
    });

    socket.on('answer', (payload) => {
      socket.to(roomId).emit('answer', payload);
    });

    socket.on('ice-candidate', (payload) => {
      socket.to(roomId).emit('ice-candidate', payload);
    });

    // Chat messages
    socket.on('send-message', (message) => {
      socket.to(roomId).emit('receive-message', message);
    });
  });
});

async function start() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("✅ MongoDB connected");

    // Routes
    app.use("/api/users", userRoutes);
    app.use("/api/interviews", interviewRoutes);
    app.use("/api/questions", questionRoutes);

    // Inngest
    app.use("/api/inngest", serve({ client: inngest, functions }));

    // Health check
    app.get("/health", (req, res) => {
      res.status(200).json({ msg: "API is up and running" });
    });

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Socket.io ready for video calls`);
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

start();
