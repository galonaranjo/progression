import { useState } from "react";
import PropTypes from "prop-types";

function VideoModal({ video, onClose, onDelete, onAddTag, onRemoveTag }) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Video Player</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <video src={video.url} controls className="w-full mb-4" />
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {video.tags &&
              video.tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                  {tag}
                  <button onClick={() => onRemoveTag(video.id, tag)} className="ml-2 text-red-500">
                    &times;
                  </button>
                </span>
              ))}
          </div>
          <form onSubmit={handleAddTags} className="mt-2">
            <input
              type="text"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              placeholder="Add tags (comma-separated)"
              className="border rounded px-2 py-1 mr-2 text-black"
            />
            <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
              Add Tags
            </button>
          </form>
        </div>
        <button
          onClick={() => {
            onDelete(video.id, video.public_id);
            onClose();
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Delete Video
        </button>
      </div>
    </div>
  );
}

VideoModal.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    public_id: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};

export default VideoModal;
