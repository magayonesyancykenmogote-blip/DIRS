import dns from "dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "../backend/config/db.js";

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

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// API Routes
app.use("/users", userRoutes);
app.use("/documents", documentRoutes);
app.use("/residents", residentRoutes);
app.use("/receipts", receiptRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Connect to MongoDB once
let dbConnected = false;

if (!dbConnected) {
  connectDB().catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });
  dbConnected = true;
}

export default app;
