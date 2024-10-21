import { useState, useEffect } from "react";
import VideoItem from "../components/VideoItem";
import SearchBar from "../components/SearchBar";
import useVideoSearch from "../hooks/useVideoSearch";
import { saveVideo, getVideos, deleteVideo, clearLocalVideos, updateVideo } from "../utils/storage";
import {
  uploadToCloudinary,
  getVideosFromCloudinary,
  deleteFromCloudinary,
  updateCloudinaryTags,
} from "../api/cloudinaryApi";
import AddVideoButton from "../components/AddVideoButton";
import Masonry from "react-masonry-css";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchTerm, setSearchTerm, filteredVideos } = useVideoSearch(videos);

  useEffect(() => {
    loadVideos();
  }, []);

  //Loading videos from Cloudinary and syncing local storage in order to have a local backup of the videos and their tags.
  const loadVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cloudinaryVideos = await getVideosFromCloudinary();
      const localVideos = await getVideos();

      if (cloudinaryVideos.length === 0) {
        console.log("No videos in Cloudinary, clearing local storage...");
        await clearLocalVideos();
        setVideos([]);
      } else {
        const cloudinaryIds = new Set(cloudinaryVideos.map((v) => v.id));
        const localIds = new Set(localVideos.map((v) => v.id));

        for (const cloudVideo of cloudinaryVideos) {
          if (cloudVideo.id && !localIds.has(cloudVideo.id)) {
            console.log(`Adding missing local entry for Cloudinary video ${cloudVideo.id}`);
            await saveVideo(cloudVideo.id, { ...cloudVideo, public_id: cloudVideo.id });
          } else if (!cloudVideo.id) {
            console.error("Encountered a video without an id:", cloudVideo);
          }
        }

        // Remove any local videos that don't exist in Cloudinary
        for (const localVideo of localVideos) {
          if (!cloudinaryIds.has(localVideo.id)) {
            console.log(`Deleting local video ${localVideo.id} that doesn't exist in Cloudinary`);
            await deleteVideo(localVideo.id);
          }
        }

        // Fetch updated local videos after sync
        const updatedLocalVideos = await getVideos();

        // Merge Cloudinary videos with local metadata
        const mergedVideos = cloudinaryVideos.map((cloudVideo) => {
          const localVideo = updatedLocalVideos.find((local) => local.id === cloudVideo.id);
          return {
            ...cloudVideo,
            ...localVideo,
            public_id: cloudVideo.id, // Ensure public_id is set
          };
        });
        setVideos(mergedVideos);
      }
    } catch (error) {
      console.error("Failed to load videos:", error);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle video recording

  const handleVideoRecorded = async (videoBlob) => {
    console.log("Video recorded, blob size:", videoBlob.size);
    try {
      console.log("Uploading to Cloudinary...");
      const { id, url, thumbnailUrl, tags } = await uploadToCloudinary(videoBlob);
      console.log("Cloudinary upload successful, ID:", id, "URL:", url, "Thumbnail:", thumbnailUrl, "Tags:", tags);
      const newVideo = {
        id,
        url,
        thumbnailUrl,
        tags, // Use the tags from Cloudinary, which include auto-generated tags
        public_id: id,
        created_on: new Date().toISOString(),
        uploaded_on: new Date().toISOString(),
      };
      await saveVideo(id, newVideo);
      setVideos((prevVideos) => [newVideo, ...prevVideos]);
      console.log("Video saved to local storage and state updated");
    } catch (error) {
      console.error("Failed to upload video:", error);
      setError("Failed to upload video. Please try again.");
    }
  };

  // Handle video upload to Cloudinary
  const handleVideoUploaded = async (file) => {
    try {
      const { id, url, thumbnailUrl, created_on, uploaded_on, tags } = await uploadToCloudinary(file);
      console.log("Uploaded video data:", { id, url, thumbnailUrl, created_on, uploaded_on, tags });
      const newVideo = {
        id,
        url,
        thumbnailUrl,
        tags,
        public_id: id,
        created_on,
        uploaded_on,
      };
      await saveVideo(id, newVideo);
      setVideos((prevVideos) => [newVideo, ...prevVideos]);
    } catch (error) {
      console.error("Failed to upload video:", error);
      setError("Failed to upload video. Please try again.");
    }
  };

  const handleDeleteVideo = async (id, publicId) => {
    try {
      await deleteFromCloudinary(publicId);
      await deleteVideo(id);
      setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
      if (videos.length === 1) {
        await clearLocalVideos();
        await loadVideos();
      }
    } catch (error) {
      console.error("Failed to delete video:", error);
      setError(`Failed to delete video. Please try again. (Error: ${error.message})`);
    }
  };

  const handleAddTag = async (videoId, newTags) => {
    try {
      const videoToUpdate = videos.find((v) => v.id === videoId);
      if (!videoToUpdate) return;

      // Split newTags if it's a string, otherwise assume it's already an array
      const tagsToAdd = typeof newTags === "string" ? newTags.split(",").map((tag) => tag.trim()) : newTags;

      const updatedTags = [...new Set([...(videoToUpdate.tags || []), ...tagsToAdd])];
      const updatedVideo = { ...videoToUpdate, tags: updatedTags };

      // Update Cloudinary
      await updateCloudinaryTags(videoToUpdate.public_id, updatedTags);

      // Update local storage and state
      await updateVideo(videoId, updatedVideo);
      setVideos((prevVideos) => prevVideos.map((v) => (v.id === videoId ? updatedVideo : v)));
    } catch (error) {
      console.error("Failed to add tags:", error);
      setError("Failed to add tags. Please try again.");
    }
  };

  const handleRemoveTag = async (videoId, tagToRemove) => {
    try {
      const videoToUpdate = videos.find((v) => v.id === videoId);
      if (!videoToUpdate) return;

      const updatedTags = (videoToUpdate.tags || []).filter((tag) => tag !== tagToRemove);
      const updatedVideo = { ...videoToUpdate, tags: updatedTags };

      // Update Cloudinary
      await updateCloudinaryTags(videoToUpdate.public_id, updatedTags);

      // Update local storage and state
      await updateVideo(videoId, updatedVideo);
      setVideos((prevVideos) => prevVideos.map((v) => (v.id === videoId ? updatedVideo : v)));
    } catch (error) {
      console.error("Failed to remove tag:", error);
      setError("Failed to remove tag. Please try again.");
    }
  };

  // Masonry breakpoints
  const breakpointColumnsObj = {
    default: 5,
    1100: 4,
    700: 3,
    500: 2,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Video History</h1>
      <div className="flex mb-4">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddVideoButton onVideoRecorded={handleVideoRecorded} onVideoUploaded={handleVideoUploaded} />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mt-8">
        {isLoading ? (
          <p className="text-gray-600">Loading videos...</p>
        ) : filteredVideos.length === 0 ? (
          <p className="text-gray-600">No videos found. Try a different search term or upload a new video.</p>
        ) : (
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column">
            {filteredVideos.map((video) => (
              <div key={video.id} className="mb-4">
                <VideoItem
                  video={video}
                  onDelete={handleDeleteVideo}
                  onAddTag={handleAddTag}
                  onRemoveTag={handleRemoveTag}
                />
              </div>
            ))}
          </Masonry>
        )}
      </div>
    </div>
  );
}

export default Videos;
