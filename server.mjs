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
      params: {
        max_results: 500, // Adjust as needed
        prefix: "", // Add a prefix if you store videos in a specific folder
        type: "upload",
        context: true,
        metadata: true,
      },
    });

    const videos = response.data.resources.map((resource) => ({
      id: resource.public_id,
      url: resource.secure_url,
      created_on: resource.context?.created_on || resource.created_at,
      uploaded_on: resource.created_at,
      thumbnailUrl: cloudinary.url(resource.public_id, {
        resource_type: "video",
        transformation: [{ width: 300, height: 200, crop: "thumb" }, { format: "jpg" }],
      }),
      tags: resource.tags || [],
    }));

    res.json({ resources: videos });
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
    console.log(`Received request to update tags for ${publicId}:`, tags);

    let result;
    if (tags.length === 0) {
      console.log(`Removing all tags for ${publicId}`);
      result = await cloudinary.uploader.remove_all_tags(publicId, { resource_type: "video" });
    } else {
      console.log(`Replacing tags for ${publicId} with:`, tags);
      result = await cloudinary.uploader.replace_tag(tags, publicId, { resource_type: "video" });
    }
    console.log("Cloudinary update tags response:", result);

    // Fetch updated resource
    const updatedResource = await cloudinary.api.resource(publicId, { resource_type: "video" });
    console.log("Updated resource:", updatedResource);

    res.json({ result, tags: updatedResource.tags || [] });
  } catch (error) {
    console.error("Error updating tags:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to update tags",
      details: error.message,
      stack: error.stack,
      cloudinaryError: error.error ? error.error : undefined,
    });
  }
});

app.post("/api/clear-tags", async (req, res) => {
  try {
    const { publicId } = req.body;
    console.log(`Removing all tags for ${publicId}`);
    const result = await cloudinary.uploader.remove_all_tags(publicId, { resource_type: "video" });
    console.log("Cloudinary remove all tags response:", result);

    // Fetch updated resource
    const updatedResource = await cloudinary.api.resource(publicId, { resource_type: "video" });
    console.log("Updated resource:", updatedResource);

    res.json({ result, tags: updatedResource.tags });
  } catch (error) {
    console.error("Error clearing tags:", error);
    res.status(500).json({ error: "Failed to clear tags", details: error.message, stack: error.stack });
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
