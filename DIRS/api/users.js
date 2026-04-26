import mongoose from 'mongoose';
import { User } from '../backend/models/userModel.js';

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

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
