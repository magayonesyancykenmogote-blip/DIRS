import dns from "dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DNS configuration
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Import backend routes and models
import userRoutes from "../backend/routes/userRoutes.js";
import documentRoutes from "../backend/routes/documentRoutes.js";
import residentRoutes from "../backend/routes/residentRoutes.js";
import receiptRoutes from "../backend/routes/receiptRoutes.js";

dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

// CORS configuration with regex support for vercel.app domains
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
    ];
    
    // Allow all vercel.app domains
    if (!origin || origin.includes(".vercel.app") || origin.includes("localhost")) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to connect to MongoDB before each request
let mongoConnected = false;
let mongoConnecting = false;

app.use(async (req, res, next) => {
  // Skip connection check for health endpoint
  if (req.path === "/health" || req.path === "/api-test") {
    return next();
  }

  if (mongoConnected && mongoose.connection.readyState === 1) {
    return next();
  }

  // Prevent multiple concurrent connection attempts
  if (mongoConnecting) {
    console.log("⏳ Connection in progress, waiting...");
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
      mongoUri: process.env.MONGO_URI ? "Set" : "Not set",
      nodeEnv: process.env.NODE_ENV
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
  const mongoUri = process.env.MONGO_URI ? "Set" : "Not set";
  return res.json({ 
    status: "ok", 
    time: new Date(),
    database: dbStatus,
    mongoUri,
    mongoConnected,
    nodeEnv: process.env.NODE_ENV
  });
});

// Debug endpoint to test API
app.get("/api-test", (req, res) => {
  res.json({ 
    message: "API is working!",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    mongoUri: process.env.MONGO_URI ? "Set" : "Not set"
  });
});

// API Routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/residents", residentRoutes);
app.use("/receipts", receiptRoutes);

// Catch all other API routes
app.get("/", (req, res) => {
  res.json({ message: "DIRS API is running", endpoints: ["/users", "/documents", "/residents", "/receipts"] });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Not found", path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: err.message });
});

export default app;
