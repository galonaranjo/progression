/**
 * This file provides utility functions for interacting with the YouTube API via our server.
 *
 * It includes:
 * - A fetchWithAuth function that adds the user's access token to requests.
 * - Functions to find/create a playlist and load videos from that playlist.
 *
 * All API calls are made to our server, which then communicates with the YouTube API.
 * This approach keeps sensitive operations server-side and simplifies client-side code.
 */

import { refreshAccessToken } from "./auth"; // You'll need to implement this function

const fetchWithAuth = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token found");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      console.log("Access token expired, attempting to refresh...");
      accessToken = await refreshAccessToken();

      if (!accessToken) {
        throw new Error("Failed to refresh access token");
      }

      // Retry the request with the new token
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in fetchWithAuth:", error);
    throw error;
  }
};

export const findOrCreateAppPlaylist = async () => {
  return fetchWithAuth("http://localhost:3001/api/find-or-create-playlist");
};

export const loadVideos = async () => {
  const { playlistId } = await findOrCreateAppPlaylist();
  return fetchWithAuth(`http://localhost:3001/api/videos?playlistId=${playlistId}`);
};
