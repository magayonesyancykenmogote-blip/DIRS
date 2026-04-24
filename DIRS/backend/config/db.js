import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "document_db";

if (!uri) {
  throw new Error("Missing MONGO_URI in environment variables");
}

export const connectDB = async () => {
  await mongoose.connect(uri, {
    dbName,
  });
  console.log(`✅ Connected to MongoDB ${dbName}`);
};
