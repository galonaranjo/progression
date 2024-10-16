import { useState, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import PropTypes from "prop-types";

// Import FFmpeg core files
import coreURL from "@ffmpeg/core/dist/esm/ffmpeg-core.js?url";
import wasmURL from "@ffmpeg/core/dist/esm/ffmpeg-core.wasm?url";
import workerURL from "@ffmpeg/core/dist/esm/ffmpeg-core.worker.js?url";

function VideoTrimmer({ videoUrl, onTrimComplete }) {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10); // Default 10 seconds

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg();
        ffmpegInstance.on("log", ({ message }) => console.log(message));

        await ffmpegInstance.load({
          coreURL,
          wasmURL,
          workerURL,
        });

        setFFmpeg(ffmpegInstance);
        setReady(true);
      } catch (err) {
        console.error("Failed to load FFmpeg:", err);
        setError("Failed to load video trimmer. Please try again later.");
      }
    };

    loadFFmpeg();
  }, []);

  const trimVideo = async () => {
    if (!ffmpeg) return;

    try {
      const inputName = "input.mp4";
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(videoUrl));

      await ffmpeg.exec(["-i", inputName, "-ss", `${startTime}`, "-to", `${endTime}`, "-c", "copy", outputName]);

      const data = await ffmpeg.readFile(outputName);
      const trimmedVideoUrl = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));

      onTrimComplete(trimmedVideoUrl);
    } catch (err) {
      console.error("Error during video trimming:", err);
      setError("An error occurred while trimming the video. Please try again.");
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;
  if (!ready) return <div className="text-gray-500">Loading trimmer...</div>;

  return (
    <div>
      <video src={videoUrl} controls width="250" />
      <div>
        <label>
          Start Time:
          <input type="number" value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} />
        </label>
        <label>
          End Time:
          <input type="number" value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} />
        </label>
      </div>
      <button onClick={trimVideo}>Trim Video</button>
    </div>
  );
}

VideoTrimmer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onTrimComplete: PropTypes.func.isRequired,
};

export default VideoTrimmer;
