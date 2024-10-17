import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.VITE_CLOUDINARY_API_KEY,
  api_secret: process.env.VITE_CLOUDINARY_API_SECRET,
});

app.get("/api/videos", async (req, res) => {
  try {
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

    const response = await axios.get(`https://api.cloudinary.com/v1_1/${cloudName}/resources/video`, {
      auth: {
        username: apiKey,
        password: apiSecret,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

app.post("/api/delete-video", async (req, res) => {
  try {
    const { publicId } = req.body;
    const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = process.env.VITE_CLOUDINARY_API_SECRET;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const sha1 = await createSHA1Hash(signature);

    const response = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/video/destroy`, {
      public_id: publicId,
      signature: sha1,
      api_key: apiKey,
      timestamp: timestamp,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
});

app.post("/api/update-tags", async (req, res) => {
  try {
    const { publicId, tags } = req.body;
    const result = await cloudinary.uploader.add_tags(tags, [publicId], { resource_type: "video" });
    res.json(result);
  } catch (error) {
    console.error("Error updating tags:", error);
    res.status(500).json({ error: "Failed to update tags" });
  }
});

// Helper function to create SHA1 hash
async function createSHA1Hash(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
