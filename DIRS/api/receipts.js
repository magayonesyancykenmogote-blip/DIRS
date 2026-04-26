import mongoose from 'mongoose';
import Receipt from '../../backend/models/receiptModel.js';

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

    const { id } = req.query;

    if (req.method === 'GET') {
      if (id) {
        const receipt = await Receipt.findById(id);
        if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
        return res.json(receipt);
      } else {
        const receipts = await Receipt.find().sort({ createdAt: -1 });
        return res.json(receipts);
      }
    }

    if (req.method === 'POST') {
      const {
        receipt_id,
        order_no,
        invoice_no,
        resident_name,
        document_type,
        amount,
        date,
        time,
        status,
        processed_by,
        folder
      } = req.body;

      const newReceipt = new Receipt({
        receipt_id,
        order_no,
        invoice_no,
        resident_name,
        document_type,
        amount,
        date,
        time,
        status,
        processed_by,
        folder: folder || 'receipt'
      });

      const savedReceipt = await newReceipt.save();
      return res.status(201).json(savedReceipt);
    }

    if (req.method === 'PUT' && id) {
      const updatedReceipt = await Receipt.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      if (!updatedReceipt) return res.status(404).json({ error: 'Receipt not found' });
      return res.json(updatedReceipt);
    }

    if (req.method === 'DELETE' && id) {
      const receipt = await Receipt.findByIdAndDelete(id);
      if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
      return res.json({ message: 'Receipt deleted' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
