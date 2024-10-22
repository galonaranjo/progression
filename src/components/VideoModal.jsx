import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

function VideoModal({ video, onClose, onDelete, onAddTag, onRemoveTag }) {
  const [newTags, setNewTags] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.height = `${window.innerHeight * 0.45}px`;
    }
  }, []);

  const handleAddTags = (e) => {
    e.preventDefault();
    if (newTags.trim()) {
      const tagsArray = newTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      onAddTag(video.id, tagsArray);
      setNewTags("");
      setIsAddingTag(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-end items-center mb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none">
            &times;
          </button>
        </div>
        <video ref={videoRef} src={video.url} controls className="w-full mb-4 object-contain" />
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
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
            <div
              className={`w-full ${
                isAddingTag ? "h-12 opacity-100" : "h-0 opacity-0"
              } transition-all duration-300 ease-in-out overflow-hidden`}>
              <form onSubmit={handleAddTags} className="flex items-center mt-2">
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Add tags (comma-separated)"
                  className="border rounded px-2 py-1 mr-2 text-black flex-grow"
                />
                <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                  Add
                </button>
              </form>
            </div>
          </div>
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
