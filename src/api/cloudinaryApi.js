import { Cloudinary } from "@cloudinary/url-gen";

// Initialize Cloudinary
const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  },
});

export const uploadToCloudinary = async (file) => {
  console.log("Starting Cloudinary upload...");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  try {
    console.log("Sending request to Cloudinary...");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Cloudinary response:", data);
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const getVideosFromCloudinary = async () => {
  try {
    // const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    // const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    // const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    // const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video`;
    // const auth = btoa(`${apiKey}:${apiSecret}`);

    //   const response = await fetch(url, {
    //     headers: {
    //       Authorization: `Basic ${auth}`,
    //     },
    //   });
    const response = await fetch("http://localhost:3001/api/videos");

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resources.map((resource) => ({
      id: resource.public_id,
      url: resource.secure_url,
      created_at: resource.created_at,
    }));
  } catch (error) {
    console.error("Error fetching videos from Cloudinary:", error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const response = await fetch("http://localhost:3001/api/delete-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting video from Cloudinary:", error);
    throw error;
  }
};

export { cld };
