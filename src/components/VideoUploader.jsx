import { useState, useRef } from "react";
import PropTypes from "prop-types";

function VideoUploader({ onVideoUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      onVideoUploaded(URL.createObjectURL(file));
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
      <button onClick={handleUploadClick}>Upload Video</button>
      {selectedFile && <p>Selected file: {selectedFile.name}</p>}
    </div>
  );
}

VideoUploader.propTypes = {
  onVideoUploaded: PropTypes.func.isRequired,
};

export default VideoUploader;
