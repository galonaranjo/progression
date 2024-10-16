import { useState, useRef } from "react";
import PropTypes from "prop-types";

function VideoUploader({ onVideoUploaded, maxSizeMB = 50 }) {
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
      onVideoUploaded(file); // Pass the file directly instead of a URL
    } else {
      alert("Please select a valid video file.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileSelect} style={{ display: "none" }} ref={fileInputRef} />
      <button onClick={handleUploadClick}>Upload Video (Max {maxSizeMB}MB)</button>
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
    </div>
  );
}

VideoUploader.propTypes = {
  onVideoUploaded: PropTypes.func.isRequired,
  maxSizeMB: PropTypes.number,
};

export default VideoUploader;
