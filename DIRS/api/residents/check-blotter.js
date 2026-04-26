import mongoose from 'mongoose';
import { getCaseModel } from '../../backend/models/blotterModel.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI not configured');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        dbName: process.env.MONGO_DB_NAME || 'document_db',
        serverSelectionTimeoutMS: 10000,
      });
    }

    const { first_name, middle_name, last_name, extension } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'first_name and last_name are required' });
    }

    const Case = await getCaseModel();

    // Build resident name string for searching
    let residentName = `${first_name} ${last_name}`;
    if (middle_name) {
      residentName = `${first_name} ${middle_name} ${last_name}`;
    }
    if (extension) {
      residentName += ` ${extension}`;
    }

    // Search for blotter case with resident name
    const caseRecord = await Case.findOne({
      resident: { $regex: residentName, $options: 'i' }
    });

    if (caseRecord) {
      return res.json({
        hasBlotterRecord: true,
        message: `⚠️ This resident has a blotter case. Please verify before proceeding.`,
        record: {
          caseNo: caseRecord.caseNo || '',
          description: caseRecord.type || '',
          status: caseRecord.status || '',
          date: caseRecord.date || '',
          resident: caseRecord.resident || ''
        }
      });
    }

    return res.json({
      hasBlotterRecord: false,
      message: 'No blotter records found for this resident'
    });
  } catch (error) {
    console.error('Blotter check error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
