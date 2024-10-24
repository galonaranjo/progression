import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: import.meta.env.VITE_YOUTUBE_API_KEY,
});

export const searchVideos = async (query) => {
  try {
    const response = await youtube.search.list({
      part: "snippet",
      q: query,
      type: "video",
      maxResults: 10,
    });
    return response.data.items;
  } catch (error) {
    console.error("Error searching YouTube videos:", error);
    throw error;
  }
};

export const getVideoDetails = async (videoId) => {
  try {
    const response = await youtube.videos.list({
      part: "snippet,statistics",
      id: videoId,
    });
    return response.data.items[0];
  } catch (error) {
    console.error("Error fetching YouTube video details:", error);
    throw error;
  }
};
