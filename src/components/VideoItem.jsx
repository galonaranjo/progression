import { useState } from "react";
import PropTypes from "prop-types";

function VideoItem({ video, onDelete, onAddTag, onRemoveTag }) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [newTags, setNewTags] = useState("");

  const handleAddTags = (e) => {
    e.preventDefault();
    if (newTags.trim()) {
      const tagsArray = newTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      onAddTag(video.id, tagsArray);
      setNewTags("");
    }
  };

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  return (
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
          onClick={() => {
            /* logic to play video */
          }}
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
                <button onClick={() => onRemoveTag(video.id, tag)} className="ml-2 text-red-500">
                  &times;
                </button>
              </span>
            ))}
        </div>
        <form className="mb-2 text-black" onSubmit={handleAddTags}>
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Add tags (comma-separated)"
            className="border rounded px-2 py-1 mr-2 w-full mb-2"
          />
          <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded w-full">
            Add Tags
          </button>
        </form>
        <button
          onClick={() => onDelete(video.id, video.public_id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full">
          Delete
        </button>
      </div>
    </div>
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
