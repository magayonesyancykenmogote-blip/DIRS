import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";
import { connectDB } from "../backend/config/db.js";

// Import routes
import userRoutes from "../backend/routes/userRoutes.js";
import documentRoutes from "../backend/routes/documentRoutes.js";
import residentRoutes from "../backend/routes/residentRoutes.js";
import receiptRoutes from "../backend/routes/receiptRoutes.js";

dotenv.config();

// Fix DNS resolution for serverless environment
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    time: new Date(),
    env: process.env.NODE_ENV || "unknown"
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/receipts", receiptRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Initialize database connection once
let dbConnected = false;
let dbConnecting = false;

const initializeDB = async () => {
  if (dbConnected || dbConnecting) return;
  
  dbConnecting = true;
  try {
    await connectDB();
    dbConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    // Continue anyway - database might come up later or on next request
    dbConnecting = false;
  }
};

// Initialize database on first middleware run
app.use((req, res, next) => {
  if (!dbConnected && !dbConnecting) {
    initializeDB().catch(err => console.error("DB init error:", err));
  }
  next();
});

export default app;
