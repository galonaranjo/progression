import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import VideoRecorder from "./VideoRecorder";
import VideoUploader from "./VideoUploader";

function AddVideoButton({ onVideoRecorded, onVideoUploaded }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTakeVideo = () => {
    setIsRecorderOpen(true);
    setIsDropdownOpen(false);
  };

  const handleUploadVideo = () => {
    setIsUploaderOpen(true);
    setIsDropdownOpen(false);
  };

  const handleVideoRecorded = (blob) => {
    onVideoRecorded(blob);
    setIsRecorderOpen(false);
  };

  const handleVideoUploaded = (file) => {
    onVideoUploaded(file);
    setIsUploaderOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        +
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <button
            onClick={handleTakeVideo}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Take Video
          </button>
          <button
            onClick={handleUploadVideo}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Upload Video
          </button>
        </div>
      )}
      {isRecorderOpen && (
        <VideoRecorder onVideoRecorded={handleVideoRecorded} onClose={() => setIsRecorderOpen(false)} />
      )}
      {isUploaderOpen && (
        <VideoUploader onVideoUploaded={handleVideoUploaded} onClose={() => setIsUploaderOpen(false)} />
      )}
    </div>
  );
}

AddVideoButton.propTypes = {
  onVideoRecorded: PropTypes.func.isRequired,
  onVideoUploaded: PropTypes.func.isRequired,
};

export default AddVideoButton;
