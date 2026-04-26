import mongoose from 'mongoose';
import { User } from '../backend/models/userModel.js';
import { Document } from '../backend/models/documentModel.js';
import Receipt from '../backend/models/receiptModel.js';
import { getResidentModel } from '../backend/models/residentModel.js';

// CORS headers helper
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
}

// DB Connection
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not configured');
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || 'document_db',
      serverSelectionTimeoutMS: 10000,
    });
  }
}

// Route parser - handles both /api/resource and /resource formats
function parseRoute(url) {
  const cleanUrl = url.split('?')[0]; // Remove query params
  const parts = cleanUrl.split('/').filter(Boolean);
  
  // Skip 'api' prefix if present (e.g., /api/documents -> documents)
  const startIdx = parts[0] === 'api' ? 1 : 0;
  
  return {
    resource: parts[startIdx],
    id: parts[startIdx + 1],
    action: parts[startIdx + 2]
  };
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    const { resource, id, action } = parseRoute(req.url);

    // HEALTH CHECK
    if (resource === 'health') {
      return res.status(200).json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    }

    // ============ USERS ============
    if (resource === 'users') {
      if (req.method === 'GET') {
        if (id) {
          const user = await User.findById(id);
          if (!user) return res.status(404).json({ error: 'User not found' });
          return res.json(user);
        } else {
          const users = await User.find().sort({ createdAt: -1 });
          return res.json(users);
        }
      }
      if (req.method === 'POST') {
        const { name, email, role } = req.body;
        if (!name || !email) {
          return res.status(400).json({ error: 'name and email are required' });
        }
        const user = await User.create({ name, email, role });
        return res.status(201).json(user);
      }
      if (req.method === 'PUT' && id) {
        const { name, email, role } = req.body;
        const user = await User.findByIdAndUpdate(
          id,
          { name, email, role },
          { new: true, runValidators: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json(user);
      }
      if (req.method === 'DELETE' && id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ message: 'User deleted' });
      }
    }

    // ============ DOCUMENTS ============
    if (resource === 'documents') {
      if (req.method === 'GET') {
        const { all, date, startDate, endDate } = req.query;
        let query = {};
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
    }

    // ============ RESIDENTS ============
    if (resource === 'residents') {
      const Resident = await getResidentModel();

      if (req.method === 'GET') {
        if (id) {
          const resident = await Resident.findById(id);
          if (!resident) return res.status(404).json({ error: 'Resident not found' });
          return res.json(resident);
        } else {
          const { search, page } = req.query;
          const pageNum = parseInt(page || 1, 10);
          const limit = 20;
          const skip = (pageNum - 1) * limit;

          let query = { archival_state: 'ACTIVE' };

          if (search) {
            query.$or = [
              { first_name: { $regex: search, $options: 'i' } },
              { middle_name: { $regex: search, $options: 'i' } },
              { last_name: { $regex: search, $options: 'i' } },
              { resident_code: { $regex: search, $options: 'i' } }
            ];
          }

          const total = await Resident.countDocuments(query);
          const residents = await Resident.find(query).skip(skip).limit(limit);
          const pages = Math.ceil(total / limit);

          return res.json({ count: residents.length, total, page: pageNum, pages, data: residents });
        }
      }

      if (req.method === 'POST' && action === 'check-blotter') {
        const { resident_id } = req.body;
        // Placeholder for blotter check logic
        return res.json({ hasBlotter: false });
      }
    }

    // ============ RECEIPTS ============
    if (resource === 'receipts') {
      if (req.method === 'GET') {
        if (action === 'by-date') {
          const { startDate, endDate } = req.query;
          if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
          }
          const receipts = await Receipt.find({
            date: { $gte: startDate, $lte: endDate }
          }).sort({ date: -1 });
          return res.json(receipts);
        } else if (id) {
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
    }

    res.status(404).json({ error: 'Not found', path: req.url });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

