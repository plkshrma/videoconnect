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

// --------------------
// CORS CONFIG
// --------------------
const rawClientUrls = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = ["http://localhost:5173", ...rawClientUrls];

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // non-browser calls (health checks, curl)
  if (allowedOrigins.includes(origin)) return true;

  // Allow Vercel preview/prod domains if frontend is hosted there.
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;

  return false;
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
};

// --------------------
// SOCKET.IO SETUP
// --------------------
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"]
});

// --------------------
// MIDDLEWARE
// --------------------
app.use(express.json());

app.use(
  cors(corsOptions)
);

// --------------------
// SOCKET LOGIC (WebRTC signaling)
// --------------------
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join-room", ({ roomId, userId }) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`👤 ${userId} joined room ${roomId}`);

    // Notify others
    socket.to(roomId).emit("user-connected", userId);

    // OFFER
    socket.on("offer", (data) => {
      socket.to(data.roomId).emit("offer", data.offer);
    });

    // ANSWER
    socket.on("answer", (data) => {
      socket.to(data.roomId).emit("answer", data.answer);
    });

    // ICE CANDIDATE
    socket.on("ice-candidate", (data) => {
      socket.to(data.roomId).emit("ice-candidate", data.candidate);
    });

    // CHAT
    socket.on("send-message", (message) => {
      socket.to(roomId).emit("receive-message", message);
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log(`❌ ${userId} disconnected`);
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
    status: "OK",
    database: dbStatus,
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// --------------------
// START SERVER
// --------------------
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", async () => {
  try {
    await connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("🎥 Socket.io ready for video calls");
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
  }
});