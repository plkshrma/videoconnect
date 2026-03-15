import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    if (!ENV.DB_URL) {
      console.warn("⚠️  DB_URL not configured - skipping database connection");
      return;
    }

    const conn = await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB:", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    // Don't exit process during deployment - allow server to start
    if (process.env.NODE_ENV === 'production') {
      console.warn("⚠️  Continuing without database connection");
    } else {
      process.exit(1);
    }
  }
};
