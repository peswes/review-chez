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
    res.status(500).json({ error: "Failed to load reviews", details: error.message });
  }
}
