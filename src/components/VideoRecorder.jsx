import { useState, useRef } from "react";
import PropTypes from "prop-types";

function VideoRecorder({ onVideoRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  //Request camera permission
  const requestCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "camera" });
      if (result.state === "granted") {
        return true;
      } else if (result.state === "prompt") {
        // Trigger the permission prompt
        await navigator.mediaDevices.getUserMedia({ video: true });
        return true;
      } else if (result.state === "denied") {
        setPermissionDenied(true);
        return false;
      } else {
        console.warn("Camera permission denied");
        return false;
      }
    } catch (error) {
      console.error("Error requesting camera permission:", error);
      return false;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    //Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: "video/mp4" });
        const videoURL = URL.createObjectURL(blob);
        onVideoRecorded(videoURL);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  //Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  //Render the video recorder
  if (permissionDenied) {
    return (
      <div>
        <p>
          Camera access is required to use this feature. Please enable camera access in your browser settings and reload
          the page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <video ref={videoRef} autoPlay muted style={{ width: "100%", maxWidth: "500px" }} />
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
}

VideoRecorder.propTypes = {
  onVideoRecorded: PropTypes.func.isRequired,
};

export default VideoRecorder;
