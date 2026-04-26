import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

// Document Model
const documentSchema = new mongoose.Schema(
  {
    order_no: { type: String, required: true, trim: true },
    invoice_no: { type: String, required: true, trim: true },
    resident_name: { type: String, required: true, trim: true },
    document_type: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, required: true, trim: true },
    processed_by: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

let Document;

// Initialize MongoDB connection
async function initDB() {
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "document_db";

    if (!uri) throw new Error("Missing MONGO_URI");

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri, {
        dbName,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
    }

    if (!Document) {
      Document = mongoose.model("Document", documentSchema);
    }
  } catch (err) {
    console.error("Database error:", err.message);
    throw err;
  }
}

// GET /api/documents - retrieve documents
// POST /api/documents - create document
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initDB();

    if (req.method === 'GET') {
      const dateStr = req.query.date;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;
      const all = req.query.all === 'true';
      let docs;

      if (all) {
        docs = await Document.find({}).sort({ createdAt: -1 });
      } else if (startDate && endDate) {
        docs = await Document.find({
          date: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });
      } else if (dateStr) {
        docs = await Document.find({ date: dateStr }).sort({ createdAt: -1 });
      } else {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        docs = await Document.find({
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: -1 });
      }

      return res.status(200).json(docs);
    } else if (req.method === 'POST') {
      const newDoc = new Document(req.body);
      const saved = await newDoc.save();
      return res.status(201).json(saved);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
