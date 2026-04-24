import dns from "dns";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.SERVER_PORT || 4000;
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("Missing MONGO_URI in environment variables");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
});

async function connectMongo() {
  await client.connect();
  console.log("✅ Express API connected to MongoDB");
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/documents", async (req, res) => {
  try {
    const db = client.db(process.env.MONGO_DB_NAME || "document_db");
    const docs = await db.collection("documents").find({}).limit(50).toArray();
    res.json({ count: docs.length, data: docs });
  } catch (error) {
    console.error("Mongo read error", error);
    res.status(500).json({ error: "Failed to read documents" });
  }
});

app.post("/api/documents", async (req, res) => {
  try {
    const db = client.db(process.env.MONGO_DB_NAME || "document_db");
    const payload = req.body;
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const result = await db.collection("documents").insertOne(payload);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    console.error("Mongo insert error", error);
    res.status(500).json({ error: "Failed to insert document" });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
