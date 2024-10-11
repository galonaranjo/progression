import { useState } from "react";
import VideoRecorder from "../components/VideoRecorder";
import VideoUploader from "../components/VideoUploader";

function Videos() {
  const [videos, setVideos] = useState([]);

  const handleVideoRecorded = (videoURL) => {
    setVideos((prevVideos) => [...prevVideos, videoURL]);
  };

  const handleVideoUploaded = (videoURL) => {
    setVideos((prevVideos) => [...prevVideos, videoURL]);
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
            {videos.map((videoURL, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <video src={videoURL} controls className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-gray-600">Video {index + 1}</p>
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
