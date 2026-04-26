import { connectDB } from "../backend/config/db.js";
import User from "../backend/models/userModel.js";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    if (req.method === "GET") {
      const users = await User.find();
      return res.status(200).json(users);
    }

    if (req.method === "POST") {
      const user = await User.create(req.body);
      return res.status(201).json(user);
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
