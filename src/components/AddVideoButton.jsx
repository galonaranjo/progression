import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

function AddVideoButton({ onTakeVideo, onUploadVideo }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    onTakeVideo();
    setIsDropdownOpen(false);
  };

  const handleUploadVideo = () => {
    onUploadVideo();
    setIsDropdownOpen(false);
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
    </div>
  );
}

AddVideoButton.propTypes = {
  onTakeVideo: PropTypes.func.isRequired,
  onUploadVideo: PropTypes.func.isRequired,
};

export default AddVideoButton;
