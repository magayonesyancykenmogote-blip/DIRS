import { connectDB } from "../backend/config/db.js";
import User from "../backend/models/userModel.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    if (req.method === "GET") {
      const users = await User.find();
      return res.status(200).json(users);
    }

    res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}