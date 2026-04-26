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

app.use(async (req, res, next) => {
  if (mongoConnected && mongoose.connection.readyState === 1) {
    return next();
  }

  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "document_db";

    if (!uri) {
      throw new Error("Missing MONGO_URI in environment variables");
    }

    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, { dbName });
    }
    mongoConnected = true;
    next();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    res.status(500).json({ error: "Database connection failed", details: err.message });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// API Routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/residents", residentRoutes);
app.use("/receipts", receiptRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

export default app;
