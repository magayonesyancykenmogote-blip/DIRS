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
  origin: /https:\/\/.+\.vercel\.app$/,
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// Routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/residents", residentRoutes);
app.use("/receipts", receiptRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Initialize database connection
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
    dbConnecting = false;
  }
};

// Middleware to initialize DB
app.use((req, res, next) => {
  if (!dbConnected && !dbConnecting) {
    initializeDB().catch(err => console.error("DB init error:", err));
  }
  next();
});

export default app;
