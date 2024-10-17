import { useState } from "react";
import PropTypes from "prop-types";

function VideoItem({ video, onDelete, onAddTag, onRemoveTag }) {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(video.id, newTag.trim());
      setNewTag("");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <video src={video.url} controls className="w-full h-48 object-cover" />
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
        <form className="mb-2 text-black" onSubmit={handleAddTag}>
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="border rounded px-2 py-1 mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
            Add Tag
          </button>
        </form>
        <button
          onClick={() => onDelete(video.id, video.public_id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
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
    tags: PropTypes.arrayOf(PropTypes.string),
    public_id: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onAddTag: PropTypes.func.isRequired,
  onRemoveTag: PropTypes.func.isRequired,
};

export default VideoItem;
