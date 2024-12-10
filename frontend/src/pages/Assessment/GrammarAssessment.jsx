import React, { useState, useRef } from "react";
import { Mic, MicOff, ChevronRight, Volume2 } from "lucide-react";
import ConversationLayout from "../layouts/ConversationLayout";
import WaveformVisualizer from "../components/WaveformVisualizer";

function GrammarAssessment() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [audioStream, setAudioStream] = useState(null);

  const questions = [
    "Describe your typical daily routine.",
    "What did you do last weekend?",
    "What are your plans for the future?",
    "Tell me about your favorite hobby.",
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      setAudioStream(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        sendAudioToServer(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("http://localhost:8000/process-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Server response:", data);
    } catch (err) {
      console.error("Error sending audio:", err);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsRecording(false);
    }
  };

  return (
    <ConversationLayout>
      {/* Header with gradient background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange opacity-10 rounded-t-2xl" />

      {/* Progress Bar */}
      <div className="mb-8 relative">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-medium bg-brand-yellow/10 text-brand-orange px-3 py-1 rounded-full">
            Question {currentQuestionIndex + 1}/{questions.length}
          </span>
          <span className="bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full">
            Grammar Assessment
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-brand-blue via-brand-purple to-brand-orange rounded-full h-3 transition-all duration-300"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / questions.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Question Display with enhanced styling */}
      <div className="text-center mb-12 p-6 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          {questions[currentQuestionIndex]}
        </h2>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Volume2 className="text-brand-purple" size={18} />
          Press the microphone button and speak your answer
        </p>
      </div>

      {/* Recording Interface with Waveform */}
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <button
            onClick={handleRecord}
            className={`p-6 rounded-full transition-all duration-300 shadow-lg ${
              isRecording
                ? "bg-brand-red text-white animate-pulse ring-4 ring-red-200"
                : "bg-gradient-to-r from-brand-blue to-brand-purple text-white hover:from-brand-purple hover:to-brand-orange"
            }`}
          >
            {isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>
          {isRecording && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
            </div>
          )}
        </div>

        {/* Waveform Visualizer */}
        <div className="w-full max-w-md p-4 bg-gray-50 rounded-xl shadow-inner">
          <WaveformVisualizer isRecording={isRecording} stream={audioStream}/>
        </div>

        <span className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100">
          {isRecording ? "Recording..." : "Click to start recording"}
        </span>
      </div>

      {/* Navigation with gradient button */}
      <div className="mt-12 flex justify-end">
        <button
          onClick={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg shadow-md ${
            currentQuestionIndex === questions.length - 1
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-purple hover:to-brand-orange text-white transform hover:scale-105"
          } transition-all duration-300`}
        >
          <span>Next Question</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </ConversationLayout>
  );
}

export default GrammarAssessment;
