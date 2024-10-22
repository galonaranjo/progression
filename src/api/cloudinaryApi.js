import { Cloudinary } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";

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

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Cloudinary response:", data);

    // Generate thumbnail URL using Cloudinary SDK
    const thumbnailUrl = cld.video(data.public_id).resize(thumbnail().width(300).height(200)).format("jpg").toURL();

    return {
      id: data.public_id,
      url: data.secure_url,
      thumbnailUrl: thumbnailUrl,
      created_on: data.created_at,
      uploaded_on: new Date().toISOString(),
      tags: data.tags || [], // Ensure tags are included here
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export const getVideosFromCloudinary = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/videos");

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resources.map((resource) => ({
      id: resource.id,
      url: resource.url,
      thumbnailUrl: cld.video(resource.id).resize(thumbnail().width(300).height(200)).format("jpg").toURL(),
      created_on: resource.created_on,
      uploaded_on: resource.uploaded_on,
      tags: resource.tags || [],
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

export const updateCloudinaryTags = async (publicId, tags) => {
  try {
    console.log(`Updating tags for ${publicId}:`, tags);
    const response = await fetch("http://localhost:3001/api/update-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId, tags }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error response from server:", result);
      throw new Error(
        `Failed to update tags: ${result.error}\nDetails: ${result.details}\nCloudinary Error: ${result.cloudinaryError}`
      );
    }

    console.log("Cloudinary update response:", result);
    console.log("Updated tags from Cloudinary:", result.tags);
    return result;
  } catch (error) {
    console.error("Error updating tags in Cloudinary:", error);
    throw error;
  }
};

export { cld };
