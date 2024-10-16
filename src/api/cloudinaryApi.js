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

  // Add the original creation date if available
  let creationDate;
  if (file.lastModified) {
    creationDate = new Date(file.lastModified).toISOString();
  } else {
    creationDate = new Date().toISOString();
  }
  formData.append("context", `created_on=${creationDate}`);

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
      const errorText = await response.text();
      console.error("Cloudinary error response:", errorText);
      throw new Error(`Upload failed with status: ${response.status}. Error: ${errorText}`);
    }

    const data = await response.json();
    console.log("Cloudinary response:", data);

    // Generate thumbnail URL using Cloudinary's URL-based transformations
    const thumbnailUrl = data.secure_url.replace("/upload/", "/upload/c_thumb,w_300,h_200,f_auto/");

    return {
      id: data.public_id,
      url: data.secure_url,
      thumbnailUrl: thumbnailUrl,
      created_on: creationDate,
      uploaded_on: new Date().toISOString(),
    };
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

export const updateCloudinaryTags = async (publicId, tags) => {
  try {
    // If tags is an empty array, we need to clear all tags
    if (Array.isArray(tags) && tags.length === 0) {
      const response = await fetch("http://localhost:3001/api/clear-tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to clear tags: ${errorData.error}`);
      }

      return await response.json();
    }

    // Otherwise, proceed with updating tags as before
    const tagsString = Array.isArray(tags) ? tags.join(",") : tags;
    const response = await fetch("http://localhost:3001/api/update-tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId, tags: tagsString }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to update tags: ${errorData.error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating tags in Cloudinary:", error);
    throw error;
  }
};

export { cld };
