import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

function CustomVideoPlayer({ src, width, height }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [isPortrait, setIsPortrait] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16 / 9");
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      const videoIsPortrait = video.videoHeight > video.videoWidth;
      setIsPortrait(videoIsPortrait);
      setAspectRatio(videoIsPortrait ? "9 / 16" : "16 / 9");
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", updateProgress);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const updateProgress = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (e) => {
    const video = videoRef.current;
    const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * video.duration;
    video.currentTime = seekTime;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto"
      style={{
        maxHeight: "45vh",
        aspectRatio: aspectRatio,
      }}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain rounded-lg shadow-lg"
        onClick={togglePlay}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
        <div className="flex items-center justify-between mb-2">
          <button onClick={togglePlay} className="focus:outline-none">
            {isPlaying ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 mr-2"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </div>
        </div>
        <div className="relative h-1 bg-gray-300 rounded-full">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}></div>
          <div className="absolute top-0 left-0 w-full h-full cursor-pointer" onClick={seek}></div>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>{formatTime(videoRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}

CustomVideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default CustomVideoPlayer;
