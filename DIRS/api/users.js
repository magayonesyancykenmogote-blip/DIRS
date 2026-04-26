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

    // Simple user schema for testing
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      createdAt: { type: Date, default: Date.now }
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    if (req.method === 'GET') {
      const users = await User.find().limit(10);
      return res.status(200).json(users);
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: error.message });
  }
}
