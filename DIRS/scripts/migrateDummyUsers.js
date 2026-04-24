import dns from 'dns';
dns.setServers(['1.1.1.1','8.8.8.8']);
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || 'document_db';

const dummyUsers = [
  { name: 'Clerk Maria', email: 'clerk.maria@example.com', role: 'user' },
  { name: 'Admin Jose', email: 'admin.jose@example.com', role: 'admin' },
  { name: 'Test User', email: 'testuser@example.com', role: 'user' },
];

async function migrate() {
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  const existing = await users.find({ email: { $in: dummyUsers.map((u) => u.email) } }).toArray();
  const existingEmails = new Set(existing.map((u) => u.email));
  const toInsert = dummyUsers.filter((u) => !existingEmails.has(u.email));

  if (toInsert.length > 0) {
    const result = await users.insertMany(toInsert);
    console.log('Inserted', result.insertedCount, 'users');
  } else {
    console.log('No new users to insert');
  }

  const all = await users.find().toArray();
  console.log('All users in Mongo:');
  console.table(all.map((u) => ({ _id: u._id.toString(), name: u.name, email: u.email, role: u.role })));
  await client.close();
}

migrate().catch((err) => {console.error(err); process.exit(1);});