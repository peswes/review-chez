// /api/getReviews.js
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
  res.setHeader("Access-Control-Allow-Origin", "*"); // Replace * with your domain for production
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 🛑 Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  try {
    const client = await connectToDatabase();
    const db = client.db();

    const reviews = await db
      .collection("reviews")
      .find({ productId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({
      error: "Failed to load reviews",
      details: error.message,
    });
  }
}
