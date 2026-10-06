import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectDB() {
  if (db) return db;

  await client.connect();
  db = client.db("personalFinance");

  console.log("MongoDB connected successfully!");

  return db;
}

export async function getDB() {
  if (!db) return await connectDB();
  return db;
}