// /api/submitReview.js
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri, options);
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req, res) {
  // 🔐 Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // For production, replace * with your frontend domain
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🛑 Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, message, productId } = req.body;

  if (!name || !message || !productId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const result = await db.collection("reviews").insertOne({
      name,
      message,
      productId,
      createdAt: new Date(),
    });

    res.status(200).json({ success: true, reviewId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
