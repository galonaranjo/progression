import { useState, useEffect } from "react";
import VideoRecorder from "../components/VideoRecorder";
import VideoUploader from "../components/VideoUploader";
import VideoTrimmer from "../components/VideoTrimmer";
import { saveVideo, getVideos, deleteVideo, updateVideo } from "../utils/storage";

function Videos() {
  const [videos, setVideos] = useState([]);
  const [trimmingVideo, setTrimmingVideo] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const savedVideos = await getVideos();
      setVideos(
        savedVideos
          .map((video) => {
            if (!video.url) {
              console.warn(`Video with id ${video.id} is missing a URL`);
              return null;
            }
            return {
              id: video.id || Date.now(),
              url: video.url,
            };
          })
          .filter(Boolean)
      );
    } catch (error) {
      console.error("Failed to load videos:", error);
    }
  };

  const handleVideoRecorded = async (videoURL) => {
    const newVideo = { id: Date.now(), url: videoURL };
    await saveVideo(newVideo.id, newVideo);
    setVideos((prevVideos) => [...prevVideos, newVideo]);
  };

  const handleVideoUploaded = async (videoURL) => {
    const newVideo = { id: Date.now(), url: videoURL };
    await saveVideo(newVideo.id, newVideo);
    setVideos((prevVideos) => [...prevVideos, newVideo]);
  };

  const handleDeleteVideo = async (id) => {
    await deleteVideo(id);
    setVideos((prevVideos) => prevVideos.filter((video) => video.id !== id));
  };

  const handleTrimVideo = (video) => {
    setTrimmingVideo(video);
  };

  const handleTrimComplete = async (trimmedVideoURL) => {
    const updatedVideo = { ...trimmingVideo, url: trimmedVideoURL };
    await updateVideo(updatedVideo.id, updatedVideo);
    setVideos((prevVideos) => prevVideos.map((video) => (video.id === updatedVideo.id ? updatedVideo : video)));
    setTrimmingVideo(null);
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
                  <button onClick={() => handleTrimVideo(video)} className="text-blue-500">
                    Trim
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {trimmingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <VideoTrimmer videoUrl={trimmingVideo.url} onTrimComplete={handleTrimComplete} />
            <button onClick={() => setTrimmingVideo(null)} className="mt-4 text-red-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Videos;
