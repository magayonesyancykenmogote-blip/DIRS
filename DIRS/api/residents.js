import mongoose from 'mongoose';
import { getResidentModel } from '../backend/models/residentModel.js';

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

    const Resident = await getResidentModel();

    if (req.method === 'GET') {
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

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
