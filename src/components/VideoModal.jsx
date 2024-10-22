import { useState } from "react";
import PropTypes from "prop-types";
import CustomVideoPlayer from "./CustomVideoPlayer";

function VideoModal({ video, onClose, onDelete, onAddTag, onRemoveTag }) {
  const [newTags, setNewTags] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTags = (e) => {
    e.preventDefault();
    if (newTags.trim()) {
      onAddTag(
        video.id,
        newTags.split(",").map((tag) => tag.trim())
      );
      setNewTags("");
      setIsAddingTag(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Video Player</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <CustomVideoPlayer src={video.url} />
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={() => setIsAddingTag(!isAddingTag)}
              className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold hover:bg-blue-600 transition-colors duration-200">
              + Add Tag
            </button>
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
          {isAddingTag && (
            <form onSubmit={handleAddTags} className="flex items-center mt-2">
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Add tags (comma-separated)"
                className="border rounded px-2 py-1 mr-2 flex-grow"
              />
              <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                Add
              </button>
            </form>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onDelete(video.id, video.public_id)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Delete Video
          </button>
        </div>
      </div>
    </div>
  );
}

VideoModal.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    public_id: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};

export default VideoModal;
