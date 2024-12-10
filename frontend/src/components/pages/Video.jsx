

import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';

const Video = () => {
  const handleSubmit = async (mediaBlobUrl) => {
    try {
      const response = await fetch(mediaBlobUrl);
      const videoBlob = await response.blob();
      const audioBlob = await extractAudioFromVideo(videoBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audioElement = new Audio(audioUrl);
      audioElement.play();

      // Fetch pre-signed URL from the backend
      const presignedUrlResponse = await fetch('http://localhost:5000/api/upload/generate-presigned-url', {
        method: 'POST',
      });

      if (!presignedUrlResponse.ok) {
        const errorText = await presignedUrlResponse.text();
        throw new Error(`Failed to fetch pre-signed URL: ${errorText}`);
      }

      const { url } = await presignedUrlResponse.json(); // Parse the JSON response to get the URL

      console.log("Url for uploading video below");
      console.log(url);

      // Upload the audio file to S3 using the pre-signed URL
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/mpeg',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Failed to upload audio: ${errorText}`);
      }

      console.log('Successfully uploaded audio');
    } catch (error) {
      console.error('Error submitting audio:', error);
    }
  };

  const extractAudioFromVideo = (videoBlob) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(videoBlob);
      // videoElement.volume = 0; // Mute the video element

      videoElement.onloadedmetadata = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(videoElement);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioContext.destination);

        const mediaRecorder = new MediaRecorder(destination.stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
          resolve(audioBlob);
        };

        mediaRecorder.start();
        videoElement.play();

        videoElement.onended = () => {
          mediaRecorder.stop();
          audioContext.close();
        };
      };

      videoElement.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Video Interview</h1>
      <p className="text-gray-600 mb-8">Practice interview scenarios with real-time feedback.</p>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <ReactMediaRecorder
          video
          render={({ status, startRecording, stopRecording, mediaBlobUrl, previewStream }) => (
            <div className="flex flex-col items-center">
              <p className="text-gray-700 mb-4">{status}</p>
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={startRecording}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  Start Recording
                </button>
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Stop Recording
                </button>
              </div>
              <div className="flex space-x-4 w-full max-w-2xl">
                {previewStream && (
                  <video
                    className="w-1/2 rounded-lg mb-4"
                    ref={(video) => {
                      if (video) {
                        video.srcObject = previewStream;
                      }
                    }}
                    autoPlay
                    muted
                  />
                )}
                {mediaBlobUrl && (
                  <video
                    className="w-1/2 rounded-lg"
                    src={mediaBlobUrl}
                    controls
                    autoPlay
                    loop
                  />
                )}
              </div>
              {mediaBlobUrl && (
                <button
                  onClick={() => handleSubmit(mediaBlobUrl)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Submit Audio
                </button>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Video;