import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

function VideoRecorder({ onVideoRecorded, onClose }) {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(cameraStream);
      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setPermissionDenied(true);
    }
  };

  const startRecording = () => {
    if (!stream) return;

    try {
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        onVideoRecorded(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Record Video</h2>
          <button onClick={onClose} className="text-2xl">
            &times;
          </button>
        </div>
        {permissionDenied ? (
          <p>
            Camera access is required to use this feature. Please enable camera access in your browser settings and
            reload the page.
          </p>
        ) : (
          <>
            <video ref={videoRef} autoPlay muted style={{ width: "100%", maxWidth: "500px" }} className="mb-4" />
            <div className="flex justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`px-4 py-2 rounded ${isRecording ? "bg-red-500" : "bg-blue-500"} text-white`}>
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

VideoRecorder.propTypes = {
  onVideoRecorded: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default VideoRecorder;
