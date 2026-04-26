import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  createdAt: { type: Date, default: Date.now }
});

// Document Schema
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

let User, Document;

async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'document_db';

    if (!mongoUri) throw new Error('MONGO_URI not set');

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { dbName });
    }

    if (!User) User = mongoose.models.User || mongoose.model('User', userSchema);
    if (!Document) Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
  } catch (error) {
    console.error('DB Error:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  try {
    await connectDB();

    // Routes
    if (pathname === '/api/health') {
      return res.status(200).json({ status: 'ok', database: 'connected', timestamp: new Date() });
    }

    if (pathname === '/api/users') {
      if (req.method === 'GET') {
        const users = await User.find().limit(10);
        return res.status(200).json(users);
      }
      if (req.method === 'POST') {
        const user = new User(req.body);
        await user.save();
        return res.status(201).json(user);
      }
    }

    if (pathname === '/api/documents') {
      if (req.method === 'GET') {
        const docs = await Document.find().limit(20).sort({ createdAt: -1 });
        return res.status(200).json(docs);
      }
      if (req.method === 'POST') {
        const doc = new Document(req.body);
        await doc.save();
        return res.status(201).json(doc);
      }
    }

    res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
