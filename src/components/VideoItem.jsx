import { useState } from "react";
import PropTypes from "prop-types";
import VideoModal from "./VideoModal";

function VideoItem({ video, onDelete, onAddTag, onRemoveTag }) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          {thumbnailError ? (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Thumbnail unavailable</span>
            </div>
          ) : (
            <img
              src={video.thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-48 object-cover"
              onError={handleThumbnailError}
            />
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <div className="mb-2">
            {video.tags &&
              video.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <VideoModal
          video={video}
          onClose={() => setIsModalOpen(false)}
          onDelete={onDelete}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />
      )}
    </>
  );
}

VideoItem.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    public_id: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};

export default VideoItem;
