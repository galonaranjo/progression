const express = require("express");
const { google } = require("googleapis");
const cors = require("cors");
require("dotenv").config();
const helmet = require("helmet");

const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet.referrerPolicy({ policy: "no-referrer-when-downgrade" }));

const APP_PLAYLIST_TITLE = "Movement Videos";

//==============================================================================
// YouTube Client Setup
//==============================================================================

const getYoutubeClient = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
};

//==============================================================================
// Playlist and Video Management
//==============================================================================

// Groups all YouTube operations for consistency and easier management

const youtubeOperations = {
  findOrCreateAppPlaylist: async (youtube) => {
    console.log("Calling YouTube API to list playlists...");
    try {
      const playlistsResponse = await youtube.playlists.list({
        part: "snippet",
        mine: true,
      });
      console.log("Playlists response:", playlistsResponse.data);

      let appPlaylist = playlistsResponse.data.items.find((playlist) => playlist.snippet.title === APP_PLAYLIST_TITLE);

      if (!appPlaylist) {
        console.log("App playlist not found, creating new playlist...");
        const newPlaylistResponse = await youtube.playlists.insert({
          part: "snippet",
          requestBody: {
            snippet: {
              title: APP_PLAYLIST_TITLE,
              description: "Videos managed by MyApp",
            },
          },
        });
        console.log("New playlist created:", newPlaylistResponse.data);
        appPlaylist = newPlaylistResponse.data;
      } else {
        console.log("Existing app playlist found:", appPlaylist);
      }

      return appPlaylist;
    } catch (error) {
      console.error("Error in findOrCreateAppPlaylist:", error.response?.data || error);
      throw error;
    }
  },

  getVideosFromPlaylist: async (youtube, playlistId) => {
    const videosResponse = await youtube.playlistItems.list({
      part: "snippet,contentDetails",
      playlistId: playlistId,
      maxResults: 50,
    });

    return videosResponse.data.items.map((item) => ({
      id: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      position: item.snippet.position,
    }));
  },
};

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Token payload:", payload);
    return payload;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

app.get("/api/find-or-create-playlist", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    return res.status(401).json({ error: "No access token provided" });
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    return res.status(401).json({ error: "Invalid access token" });
  }

  console.log("Access token received:", accessToken);

  const youtube = getYoutubeClient(accessToken);

  try {
    console.log("Attempting to find or create playlist...");
    const appPlaylist = await youtubeOperations.findOrCreateAppPlaylist(youtube);
    console.log("Playlist found or created:", appPlaylist);
    res.json({ playlistId: appPlaylist.id });
  } catch (error) {
    console.error("Error finding or creating playlist:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Failed to find or create playlist", details: error.response?.data || error.message });
  }
});

app.get("/api/videos", async (req, res) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const playlistId = req.query.playlistId;

  if (!accessToken) {
    return res.status(401).json({ error: "No access token provided" });
  }

  if (!playlistId) {
    return res.status(400).json({ error: "No playlist ID provided" });
  }

  const youtube = getYoutubeClient(accessToken);

  try {
    const videos = await youtubeOperations.getVideosFromPlaylist(youtube, playlistId);
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
