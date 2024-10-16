import { useState, useEffect } from "react";
import VideoRecorder from "../components/VideoRecorder";
import VideoUploader from "../components/VideoUploader";
import { saveVideo, getVideos, deleteVideo, clearLocalVideos } from "../utils/storage";
import { uploadToCloudinary, getVideosFromCloudinary, deleteFromCloudinary } from "../api/cloudinaryApi";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

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

  const handleVideoRecorded = async (videoBlob) => {
    console.log("Video recorded, blob size:", videoBlob.size);
    try {
      console.log("Uploading to Cloudinary...");
      const cloudinaryUrl = await uploadToCloudinary(videoBlob);
      console.log("Cloudinary upload successful, URL:", cloudinaryUrl);
      const newVideo = { id: Date.now(), url: cloudinaryUrl };
      await saveVideo(newVideo.id, newVideo);
      setVideos((prevVideos) => [...prevVideos, newVideo]);
      console.log("Video saved to local storage and state updated");
    } catch (error) {
      console.error("Failed to upload video:", error);
      setError("Failed to upload video. Please try again.");
    }
  };

  const handleVideoUploaded = async (file) => {
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      const newVideo = { id: Date.now(), url: cloudinaryUrl };
      await saveVideo(newVideo.id, newVideo);
      setVideos((prevVideos) => [...prevVideos, newVideo]);
    } catch (error) {
      console.error("Failed to upload video:", error);
      setError("Failed to upload video. Please try again.");
    }
  };

  const handleDeleteVideo = async (id, publicId) => {
    setDeleteError(null);
    try {
      // Delete from Cloudinary
      console.log("Deleting from Cloudinary...");
      await deleteFromCloudinary(publicId);

      // Delete from local storage
      console.log("Deleting from local storage...");
      await deleteVideo(id);

      // Update state
      setVideos((prevVideos) => {
        const updatedVideos = prevVideos.filter((video) => video.id !== id);
        return updatedVideos;
      });
      console.log("Video deleted from state");

      // If this was the last video, clear local storage
      if (videos.length === 1) {
        console.log("Clearing all local videos...");
        await clearLocalVideos();
      }

      // Refresh the video list to ensure consistency
      await loadVideos();
    } catch (error) {
      console.error("Failed to delete video:", error);
      setDeleteError(`Failed to delete video. Please try again. (Error: ${error.message})`);
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
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <video src={video.url} controls className="w-full h-48 object-cover" />
                <div className="p-4 flex justify-between items-center">
                  <button
                    onClick={() => handleDeleteVideo(video.id, video.public_id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
                    Delete
                  </button>
                  {deleteError && video.id === videos.find((v) => v.id === video.id)?.id && (
                    <span className="text-red-500 text-sm">{deleteError}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Videos;
