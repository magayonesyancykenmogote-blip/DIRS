import mongoose from "mongoose";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || "document_db";

    if (!mongoUri) {
      return res.status(500).json({ error: "MONGO_URI not configured" });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { dbName });
    }

    // Simple document schema for testing
    const documentSchema = new mongoose.Schema({
      order_no: String,
      invoice_no: String,
      resident_name: String,
      document_type: String,
      amount: Number,
      date: String,
      status: String,
      createdAt: { type: Date, default: Date.now }
    });

    const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);

    if (req.method === 'GET') {
      const docs = await Document.find().limit(20).sort({ createdAt: -1 });
      return res.status(200).json(docs);
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message });
  }
}

}
