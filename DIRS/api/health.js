import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      return res.status(500).json({
        error: "MONGO_URI not configured",
        mongoUri: "Not set"
      });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, {
        dbName: process.env.MONGO_DB_NAME || "document_db",
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
    }

    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    return res.status(200).json({
      status: "ok",
      message: "✅ API is working!",
      database: dbStatus,
      mongoUri: "Set",
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check error:", error);
    return res.status(500).json({
      status: "error",
      error: "Database connection failed",
      details: error.message,
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set"
    });
  }
}
