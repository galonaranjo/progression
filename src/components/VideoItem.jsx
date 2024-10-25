import { useState } from "react";
import PropTypes from "prop-types";
import VideoModal from "./VideoModal";

function VideoItem({ video }) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  // YouTube thumbnail URL
  const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow">
        {thumbnailError ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Thumbnail unavailable</span>
          </div>
        ) : (
          <div className="w-full h-full relative overflow-hidden rounded-lg aspect-video">
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={handleThumbnailError}
            />
          </div>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-200 focus:outline-none hover:rounded-none"
          style={{ transition: "none" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-semibold">{video.title}</h3>
        <p className="text-xs text-gray-500">{video.channelTitle}</p>
      </div>
      {isModalOpen && <VideoModal video={video} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

VideoItem.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    publishedAt: PropTypes.string,
    channelTitle: PropTypes.string,
    channelId: PropTypes.string,
    position: PropTypes.number,
    privacyStatus: PropTypes.string,
    duration: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default VideoItem;
