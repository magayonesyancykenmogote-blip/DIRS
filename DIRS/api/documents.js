import mongoose from 'mongoose';
import { Document } from '../../backend/models/documentModel.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not configured');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        dbName: process.env.MONGO_DB_NAME || 'document_db',
        serverSelectionTimeoutMS: 10000,
      });
    }

    if (req.method === 'GET') {
      const { all, date, startDate, endDate } = req.query;
      let docs;

      if (all === 'true') {
        docs = await Document.find({}).sort({ createdAt: -1 });
      } else if (startDate && endDate) {
        docs = await Document.find({
          date: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });
      } else if (date) {
        docs = await Document.find({ date }).sort({ createdAt: -1 });
      } else {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        docs = await Document.find({
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }).sort({ createdAt: -1 });
      }

      return res.json({ count: docs.length, data: docs });
    }

    if (req.method === 'POST') {
      const {
        order_no,
        invoice_no,
        resident_name,
        document_type,
        amount,
        date,
        time,
        status,
        processed_by,
      } = req.body;

      if (!order_no || !invoice_no || !resident_name || !document_type ||
          amount === undefined || amount === null || !status || !processed_by) {
        return res.status(400).json({ error: 'Invalid transaction payload' });
      }

      const now = new Date();
      const fallbackDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const fallbackTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const doc = await Document.create({
        order_no,
        invoice_no,
        resident_name,
        document_type,
        amount,
        date: date || fallbackDate,
        time: time || fallbackTime,
        status,
        processed_by,
      });
      return res.status(201).json(doc);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
