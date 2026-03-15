import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
// import { serve } from "inngest/express";
// import { inngest, functions } from "./lib/inngest.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import { connectDB } from "./lib/db.js";

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
    await connectDB();

    // Routes
    app.use("/api/users", userRoutes);
    app.use("/api/interviews", interviewRoutes);
    app.use("/api/questions", questionRoutes);

    // Inngest - temporarily disabled for ES module compatibility
    // app.use("/api/inngest", serve({ client: inngest, functions }));

    // Health check
    app.get("/health", (req, res) => {
      console.log(`🔍 Health check called from ${req.ip} at ${new Date().toISOString()}`);
      const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
      res.status(200).json({
        msg: "API is up and running",
        database: dbStatus,
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
      });
    });

    // Note: Frontend is deployed separately on Vercel/Netlify
    // No frontend serving needed in backend

    const PORT = process.env.PORT || 3000;
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    server.listen(PORT, HOST, () => {
      console.log(`✅ Server running on ${HOST}:${PORT}`);
      console.log(`✅ Socket.io ready for video calls`);
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

start();
