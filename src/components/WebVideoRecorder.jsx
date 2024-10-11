import { useState, useRef } from "react";

function WebVideoRecorder({ onVideoRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div className="mb-4">
      {!isRecording ? (
        <button onClick={startRecording} className="bg-blue-500 text-white px-4 py-2 rounded">
          Start Recording
        </button>
      ) : (
        <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2 rounded">
          Stop Recording
        </button>
      )}
      {isRecording && <video ref={videoRef} autoPlay muted className="mt-4 w-full max-w-md" />}
    </div>
  );
}

export default WebVideoRecorder;
