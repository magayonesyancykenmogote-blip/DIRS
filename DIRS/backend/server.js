import dns from "dns";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
import userRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));
app.use("/api/users", userRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/receipts", receiptRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const port = process.env.SERVER_PORT || 4000;

const startServer = () => {
  const server = app.listen(port, () => console.log(`🚀 Backend running at http://localhost:${port}`));

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please stop the existing backend or change SERVER_PORT.`);
      process.exit(1);
    }
    console.error('❌ Server error:', error);
    process.exit(1);
  });
};

connectDB()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    startServer();
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.log("⚠️  Starting server without database connection...");
    startServer();
  });
