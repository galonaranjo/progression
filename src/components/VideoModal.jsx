import PropTypes from "prop-types";
import YouTubePlayer from "./YoutubePlayer";

function VideoModal({ video, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Video Player</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        <div className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow flex items-center justify-center">
            <YouTubePlayer videoId={video.id} />
          </div>
          <div className="mt-4 overflow-y-auto"></div>
        </div>
      </div>
    </div>
  );
}

VideoModal.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    // ... other video properties
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VideoModal;
