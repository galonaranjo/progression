import { useState, useEffect } from "react";
import VideoRecorder from "../components/VideoRecorder";
import VideoUploader from "../components/VideoUploader";
import { saveVideo, getVideos, deleteVideo } from "../utils/storage";
import { uploadToCloudinary, getVideosFromCloudinary } from "../api/cloudinaryApi";

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

      // Merge Cloudinary videos with local metadata
      const mergedVideos = cloudinaryVideos.map((cloudVideo) => {
        const localVideo = localVideos.find((local) => local.id === cloudVideo.id);
        return {
          ...cloudVideo,
          ...localVideo, // This will overwrite Cloudinary data with local data if it exists
        };
      });

      setVideos(mergedVideos);
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
      // Handle error (e.g., show error message to user)
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
      // Handle error (e.g., show error message to user)
    }
  };

  const handleDeleteVideo = async (id) => {
    await deleteVideo(id);
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-black">My Videos</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-black">Record a New Video</h2>
        <VideoRecorder onVideoRecorded={handleVideoRecorded} />
        <VideoUploader onVideoUploaded={handleVideoUploaded} />
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-black">My Recorded Videos</h2>
        {videos.length === 0 ? (
          <p className="text-gray-600">No videos recorded yet. Upload or record a new video!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <video src={video.url} controls className="w-full h-48 object-cover" />
                <div className="p-4 flex justify-between">
                  <button onClick={() => handleDeleteVideo(video.id)} className="text-red-500">
                    Delete
                  </button>
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
