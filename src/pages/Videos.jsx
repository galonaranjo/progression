import { useState, useEffect } from "react";
import VideoRecorder from "../components/VideoRecorder";
import VideoUploader from "../components/VideoUploader";
import VideoItem from "../components/VideoItem";
import { saveVideo, getVideos, deleteVideo, clearLocalVideos, updateVideo } from "../utils/storage";
import {
  uploadToCloudinary,
  getVideosFromCloudinary,
  deleteFromCloudinary,
  updateCloudinaryTags,
} from "../api/cloudinaryApi";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch videos from Cloudinary
      const cloudinaryVideos = await getVideosFromCloudinary();

      // Fetch locally stored video metadata
      const localVideos = await getVideos();

      // If there are no videos in Cloudinary, clear local storage
      if (cloudinaryVideos.length === 0) {
        console.log("No videos in Cloudinary, clearing local storage...");
        await clearLocalVideos();
        setVideos([]);
      } else {
        const cloudinaryIds = new Set(cloudinaryVideos.map((v) => v.id));
        const localIds = new Set(localVideos.map((v) => v.id));

        // Handle videos in Cloudinary but not in local storage
        for (const cloudVideo of cloudinaryVideos) {
          if (!localIds.has(cloudVideo.id)) {
            console.log(`Adding missing local entry for Cloudinary video ${cloudVideo.id}`);
            await saveVideo(cloudVideo.id, cloudVideo);
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
            public_id: cloudVideo.id,
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
      const { id, url } = await uploadToCloudinary(videoBlob);
      console.log("Cloudinary upload successful, ID:", id, "URL:", url);
      const newVideo = { id, url, tags: [] }; // Initialize with empty tags array
      await saveVideo(id, newVideo);
      setVideos((prevVideos) => [...prevVideos, newVideo]);
      console.log("Video saved to local storage and state updated");
    } catch (error) {
      console.error("Failed to upload video:", error);
      setError("Failed to upload video. Please try again.");
    }
  };

  // Handle video upload to Cloudinary
  const handleVideoUploaded = async (file) => {
    try {
      const { id, url } = await uploadToCloudinary(file);
      const newVideo = { id, url };
      await saveVideo(id, newVideo);
      setVideos((prevVideos) => [...prevVideos, newVideo]);
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

  const handleAddTag = async (videoId, newTag) => {
    try {
      const videoToUpdate = videos.find((v) => v.id === videoId);
      if (!videoToUpdate) return;

      const updatedTags = [...new Set([...(videoToUpdate.tags || []), newTag])];
      const updatedVideo = { ...videoToUpdate, tags: updatedTags };

      // Update Cloudinary
      await updateCloudinaryTags(videoToUpdate.public_id, updatedTags);

      // Update local storage and state
      await updateVideo(videoId, updatedVideo);
      setVideos((prevVideos) => prevVideos.map((v) => (v.id === videoId ? updatedVideo : v)));
    } catch (error) {
      console.error("Failed to add tag:", error);
      setError("Failed to add tag. Please try again.");
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

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">My Videos</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-black">Record a New Video</h2>
        <VideoRecorder onVideoRecorded={handleVideoRecorded} />
        <VideoUploader onVideoUploaded={handleVideoUploaded} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-black">My Recorded Videos</h2>
        {isLoading ? (
          <p className="text-gray-600">Loading videos...</p>
        ) : videos.length === 0 ? (
          <p className="text-gray-600">No videos recorded yet. Upload or record a new video!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoItem
                key={video.id}
                video={video}
                onDelete={handleDeleteVideo}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Videos;
