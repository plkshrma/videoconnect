import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const server = createServer(app);

// Allowed origins
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL]
    : ["http://localhost:5173"];

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// --------------------
// SOCKET.IO VIDEO CALL
// --------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);

    socket.to(roomId).emit("user-connected", userId);

    // WebRTC signaling
    socket.on("offer", (payload) => {
      socket.to(roomId).emit("offer", payload);
    });

    socket.on("answer", (payload) => {
      socket.to(roomId).emit("answer", payload);
    });

    socket.on("ice-candidate", (payload) => {
      socket.to(roomId).emit("ice-candidate", payload);
    });

    // Chat
    socket.on("send-message", (message) => {
      socket.to(roomId).emit("receive-message", message);
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// --------------------
// ROUTES
// --------------------
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/questions", questionRoutes);

// --------------------
// HEALTH CHECK
// --------------------
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    msg: "API is running",
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectDB();
    console.log(`✅ Server running on port ${PORT}`);
    console.log("✅ Socket.io ready for video calls");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
  }
});