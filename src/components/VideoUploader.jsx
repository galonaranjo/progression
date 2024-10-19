import { useState, useRef } from "react";
import PropTypes from "prop-types";

function VideoUploader({ onVideoUploaded, onClose, maxSizeMB = 50 }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`);
        return;
      }
      setSelectedFile(file);
    } else {
      alert("Please select a valid video file.");
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onVideoUploaded(selectedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Upload Video</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <input type="file" accept="video/*" onChange={handleFileSelect} ref={fileInputRef} className="mb-4" />
        {selectedFile && (
          <div className="mb-4">
            <p>Selected file: {selectedFile.name}</p>
            <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
              Upload
            </button>
          </div>
        )}
        <p className="text-sm text-gray-500">Maximum file size: {maxSizeMB}MB</p>
      </div>
    </div>
  );
}

VideoUploader.propTypes = {
  onVideoUploaded: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  maxSizeMB: PropTypes.number,
};

export default VideoUploader;
