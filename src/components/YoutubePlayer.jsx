import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

function YouTubePlayer({ videoId }) {
  const playerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      new window.YT.Player(playerRef.current, {
        height: "360",
        width: "640",
        videoId: videoId,
        events: {
          onReady: (event) => {
            setIsLoading(false);
            event.target.playVideo();
          },
          onError: (event) => {
            setIsLoading(false);
            setError("An error occurred while loading the video.");
            console.error("YouTube player error:", event.data);
          },
        },
      });
    };

    return () => {
      window.onYouTubeIframeAPIReady = null;
    };
  }, [videoId]);

  if (error) {
    return <div className="text-lg text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      {isLoading && <div className="text-lg text-gray-600">Loading video...</div>}
      <div ref={playerRef}></div>
    </div>
  );
}

YouTubePlayer.propTypes = {
  videoId: PropTypes.string.isRequired,
};

export default YouTubePlayer;
