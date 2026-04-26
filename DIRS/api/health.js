import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env" });

// MongoDB connection handler
export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "document_db";

    if (!uri) {
      console.error("❌ MONGO_URI not found in environment variables");
      throw new Error("Missing MONGO_URI in environment variables");
    }

    if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
      console.log("📡 Connecting to MongoDB...");
      await mongoose.connect(uri, { dbName });
      console.log("✅ MongoDB connected successfully");
    }
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    throw err;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();
    
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    return res.status(200).json({
      message: "✅ API is working!",
      database: dbStatus,
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set",
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database connection failed",
      details: error.message,
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set"
    });
  }
}
