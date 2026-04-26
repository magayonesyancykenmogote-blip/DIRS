import dns from "dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
import userRoutes from "../backend/routes/userRoutes.js";
import documentRoutes from "../backend/routes/documentRoutes.js";
import residentRoutes from "../backend/routes/residentRoutes.js";
import receiptRoutes from "../backend/routes/receiptRoutes.js";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://*.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware to connect to MongoDB before each request
let mongoConnected = false;
let mongoConnecting = false;

app.use(async (req, res, next) => {
  // Skip connection check for health endpoint
  if (req.path === "/health") {
    return next();
  }

  if (mongoConnected && mongoose.connection.readyState === 1) {
    return next();
  }

  // Prevent multiple concurrent connection attempts
  if (mongoConnecting) {
    console.log("Connection in progress, waiting...");
    let attempts = 0;
    while (mongoConnecting && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (mongoose.connection.readyState === 1) {
      return next();
    }
  }

  try {
    mongoConnecting = true;
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "document_db";

    if (!uri) {
      console.error("❌ MONGO_URI not found in environment variables");
      throw new Error("Missing MONGO_URI in environment variables");
    }

    console.log("📡 Connecting to MongoDB...");
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, { dbName });
      console.log("✅ MongoDB connected successfully");
    }
    mongoConnected = true;
    mongoConnecting = false;
    next();
  } catch (err) {
    mongoConnecting = false;
    console.error("❌ MongoDB connection error:", err.message);
    res.status(500).json({ 
      error: "Database connection failed", 
      details: err.message,
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set"
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  const mongoUri = process.env.MONGO_URI ? "Set" : "Not set";
  return res.json({ 
    status: "ok", 
    time: new Date(),
    database: dbStatus,
    mongoUri,
    mongoConnected
  });
});

// Debug endpoint to test API
app.get("/api-test", (req, res) => {
  res.json({ 
    message: "API is working!",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

// API Routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/residents", residentRoutes);
app.use("/receipts", receiptRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

export default app;
