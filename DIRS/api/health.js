import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      return res.status(500).json({ error: 'MONGO_URI not configured', health: 'down' });
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        dbName: process.env.MONGO_DB_NAME || 'document_db',
        serverSelectionTimeoutMS: 5000,
      });
    }

    return res.status(200).json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}


