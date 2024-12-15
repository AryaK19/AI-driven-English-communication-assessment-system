import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface VideoSectionProps {
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
  onSpeechResult: (text: string) => void;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ 
  isListening, 
  setIsListening,
  onSpeechResult 
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const webcamRef = useRef<Webcam>(null);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl p-6 border border-green-100 shadow-sm">
      <div className="flex-grow relative rounded-lg overflow-hidden mb-6 bg-green-50">
        {isVideoEnabled ? (
          <Webcam
            ref={webcamRef}
            audio={false}
            className="absolute inset-0 w-full h-full object-cover"
            mirrored={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoOff className="w-20 h-20 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="flex justify-center space-x-6">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors shadow-sm ${
            isVideoEnabled 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full transition-colors shadow-sm ${
            isListening 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-red-100 hover:bg-red-200 text-red-600'
          }`}
        >
          {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};