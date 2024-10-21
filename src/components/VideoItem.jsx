import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import VideoModal from "./VideoModal";
import { Cloudinary } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";

const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  },
});

function VideoItem({ video, onDelete, onAddTag, onRemoveTag }) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const checkOrientation = () => {
      if (videoRef.current) {
        setIsPortrait(videoRef.current.videoHeight > videoRef.current.videoWidth);
      }
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener("loadedmetadata", checkOrientation);

    return () => {
      videoElement.removeEventListener("loadedmetadata", checkOrientation);
    };
  }, [video.url]);

  const handleThumbnailError = () => {
    setThumbnailError(true);
  };

  // Generate thumbnail URL here
  const thumbnailUrl = cld
    .video(video.id)
    .resize(
      thumbnail()
        .width(300)
        .height(isPortrait ? 500 : 200)
    )
    .format("jpg")
    .toURL();

  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-grow">
        {thumbnailError ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
            <span className="text-gray-500">Thumbnail unavailable</span>
          </div>
        ) : (
          <div
            className={`w-full h-full relative overflow-hidden rounded-lg ${
              isPortrait ? "aspect-[9/16]" : "aspect-[16/9]"
            }`}>
            <img
              src={thumbnailUrl}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
              onError={handleThumbnailError}
            />
          </div>
        )}
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <video ref={videoRef} src={video.url} style={{ display: "none" }} />
      {isModalOpen && (
        <VideoModal
          video={video}
          onClose={() => setIsModalOpen(false)}
          onDelete={onDelete}
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
        />
      )}
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
