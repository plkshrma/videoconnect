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
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(express.json());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// SOCKET
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`${userId} joined room ${roomId}`);

    socket.to(roomId).emit("user-connected", userId);

    socket.on("offer", (data) => {
      socket.to(roomId).emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.to(roomId).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(roomId).emit("ice-candidate", data);
    });

    socket.on("send-message", (message) => {
      socket.to(roomId).emit("receive-message", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/questions", questionRoutes);

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});