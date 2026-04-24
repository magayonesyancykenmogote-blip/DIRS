import dns from "dns";
import { MongoClient } from "mongodb";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const uri = "mongodb+srv://document_service_user:ARPi2ffAj4RZYux4@barangaycluster.seb5lfn.mongodb.net/document_db?authSource=admin&retryWrites=true&w=majority";

async function main() {
  const client = new MongoClient(uri, { serverApi: { version: "1", strict: true, deprecationErrors: true } });
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas successfully.");

    const db = client.db("document_db");
    const collections = await db.listCollections().toArray();
    console.log("Collections in document_db:", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
