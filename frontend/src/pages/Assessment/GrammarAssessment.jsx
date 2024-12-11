import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  ChevronRight,
  Volume2,
  Video,
  VideoOff,
  Clock,
  Target,
  BookOpen,
  Star,
  CheckCircle,
  XCircle,
  Loader,
  FileText,
  ArrowLeft,
  Send,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WaveformVisualizer from "../../components/WaveformVisualizer";
import VideoPreview from "../../components/VideoPreview";

function GrammarAssessment() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [assessmentStage, setAssessmentStage] = useState("preview"); // preview, recording, review
  const [transcribedText, setTranscribedText] = useState("");
  const [feedbackData, setFeedbackData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [setupData, setSetupData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const videoRef = useRef(null);
  const previewVideoRef = useRef(null);

  const MAX_RECORDING_TIME = 120; // 2 minutes
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const questionIcons = [
    <Clock key="clock" className="text-brand-blue" size={24} />,
    <BookOpen key="book" className="text-brand-blue" size={24} />,
    <Target key="target" className="text-brand-blue" size={24} />,
    <Star key="star" className="text-brand-blue" size={24} />
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const storedSetup = localStorage.getItem('assessmentSetup');
        if (!storedSetup) {
          navigate('/assessment/setup');
          return;
        }

        const parsedSetup = JSON.parse(storedSetup);
        setSetupData(parsedSetup);

        const response = await fetch('http://localhost:8000/generate-questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(parsedSetup),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }

        const data = await response.json();
        const questionsList = Array.isArray(data.questions) ? data.questions :
          Array.isArray(data) ? data : [];

        if (questionsList.length === 0) {
          throw new Error('No questions received from the server');
        }

        setQuestions(questionsList);
        setError(null);
      } catch (err) {
        setError('Failed to load questions. Please try again.');
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [navigate]);

  const sendMediaToServer = async (mediaBlob) => {
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      if (!mediaBlob || mediaBlob.size === 0) {
        throw new Error("No recording data available");
      }

      // First upload to S3
      const formData = new FormData();
      formData.append("file", mediaBlob, `question_${currentQuestionIndex}.webm`);
      formData.append("questionIndex", currentQuestionIndex.toString());

      const uploadResponse = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload video');
      }

      const s3Data = await uploadResponse.json();
      console.log("Uploaded to S3:", s3Data.url);

      // Then process the audio
      const processFormData = new FormData();
      processFormData.append("file", mediaBlob, `question_${currentQuestionIndex}.webm`);

      const processResponse = await fetch("http://localhost:8000/process-audio", {
        method: "POST",
        body: processFormData,
      });

      if (!processResponse.ok) {
        const errorText = await processResponse.text();
        throw new Error(`Processing failed: ${errorText || processResponse.statusText}`);
      }

      const processData = await processResponse.json();

      if (processData.status === "success" && processData.text) {
        setTranscribedText(processData.text);

        // Get feedback analysis
        const feedbackResponse = await fetch("http://localhost:8000/analyze-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text: processData.text })
        });

        if (!feedbackResponse.ok) {
          throw new Error("Failed to get feedback analysis");
        }

        const feedbackResult = await feedbackResponse.json();

        setFeedbackData(prev => {
          const newFeedback = [...prev];
          newFeedback[currentQuestionIndex] = {
            text: processData.text,
            grammar: feedbackResult.grammar,
            pronunciation: feedbackResult.pronunciation,
            videoUrl: s3Data.url
          };
          return newFeedback;
        });

        // Clear the recorded blob and preview after successful upload
        setRecordedBlob(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setAssessmentStage("complete");
      } else {
        setError(processData.message || "Failed to transcribe audio");
      }

      return processData;
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Failed to upload recording. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const startRecording = async () => {
    setError(null);
    setTranscribedText("");
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });

      setMediaStream(stream);
      videoRef.current.srcObject = stream;
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const mediaBlob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(mediaBlob);
        const url = URL.createObjectURL(mediaBlob);
        setPreviewUrl(url);
        setAssessmentStage("review");
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAssessmentStage("recording");
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        "Error accessing media devices. Please check your camera and microphone permissions."
      );
      console.error("Error accessing media devices:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }

      setIsRecording(false);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleSubmitRecording = async () => {
    if (!recordedBlob) {
      setError("No recording available to submit");
      return;
    }

    try {
      await sendMediaToServer(recordedBlob);
    } catch (error) {
      console.error("Failed to process recording:", error);
      setAssessmentStage("preview");
    }
  };

  const retakeRecording = () => {
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setAssessmentStage("preview");
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setAssessmentStage("preview");
      setError(null);
      setRecordingDuration(0);
      setTranscribedText("");
      setRecordedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  const resetAssessment = () => {
    setCurrentQuestionIndex(0);
    setAssessmentStage("preview");
    setError(null);
    setRecordingDuration(0);
    setTranscribedText("");
    setFeedbackData([]);
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    stopRecording();
  };

  const viewFeedback = () => {
    localStorage.setItem('assessmentFeedback', JSON.stringify({
      questions,
      feedback: feedbackData,
      setup: setupData
    }));
    navigate('/assessment/feedback');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isAssessmentComplete = currentQuestionIndex === questions.length - 1 && transcribedText;

  if (isLoading && questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-brand-blue mx-auto mb-4" />
          <p className="text-gray-600">Loading your assessment questions...</p>
        </div>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <XCircle className="w-12 h-12 text-brand-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Questions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/assessment/setup')}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <XCircle className="w-12 h-12 text-brand-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-4">Please return to setup and try again.</p>
          <button
            onClick={() => navigate('/assessment/setup')}
            className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
          >
            Return to Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6"
    >
      <div className="h-full flex gap-6">
        {/* Left Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="w-[50%] flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="text-lg font-bold text-brand-purple flex items-center gap-2"
              >
                <CheckCircle className="text-brand-blue" size={20} />
                Grammar Assessment
              </motion.span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="px-3 py-1 bg-brand-purple/10 rounded-full text-xs font-medium text-brand-purple"
              >
                {currentQuestionIndex + 1}/{questions.length}
              </motion.span>
            </div>
            <button
              onClick={() => navigate('/assessment/setup')}
              className="text-gray-600 hover:text-brand-blue transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back to Setup</span>
            </button>
          </div>

          {/* Question Card */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-brand-blue/10 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              {questionIcons[currentQuestionIndex % questionIcons.length]}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3 pr-10">
              {questions[currentQuestionIndex]}
            </h2>
            <p className="text-gray-600 flex items-center gap-2">
              <Volume2 className="text-brand-orange" size={18} />
              Speak clearly into your microphone
            </p>
          </motion.div>

          {/* Recording Interface */}
          <div className="relative">
            <AnimatePresence>
              {!isRecording && !recordedBlob ? (
                <motion.button
                  key="start-recording"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="w-full h-16 flex items-center justify-center gap-3 bg-gradient-to-r from-brand-blue to-brand-purple text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Video size={20} />
                  Start Recording
                </motion.button>
              ) : isRecording ? (
                <motion.div
                  key="recording-wave"
                  initial={{ height: 64, opacity: 0.8 }}
                  animate={{ height: 128, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden relative"
                >
                  <WaveformVisualizer
                    isRecording={isRecording}
                    stream={mediaStream}
                  />
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 shadow-md">
                    <video
                      ref={previewVideoRef}
                      src={previewUrl}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={retakeRecording}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-gray-200 transition-colors"
                    >
                      <RefreshCw size={18} />
                      Retake
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmitRecording}
                      className="flex-1 bg-gradient-to-r from-brand-blue to-brand-purple text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <Send size={18} />
                      Submit Response
                    </motion.button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {isRecording && (
              <div className="absolute top-4 left-4 text-sm font-medium text-brand-purple">
                {formatTime(recordingDuration)} /{" "}
                {formatTime(MAX_RECORDING_TIME)}
              </div>
            )}

            {isRecording && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="absolute -top-3 -right-3 bg-brand-red text-white px-4 py-3 rounded-full shadow-lg hover:bg-brand-red/90 transition-colors flex items-center gap-2 font-medium border-2 border-white"
              >
                <VideoOff size={20} />
                <span>Stop Recording</span>
              </motion.button>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-brand-blue h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Uploading: {uploadProgress}%</p>
            </div>
          )}

          {/* Transcribed Text Display */}
          {transcribedText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-white rounded-xl shadow-md border border-brand-blue/10"
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">Transcribed Speech:</h3>
              <p className="text-gray-800">{transcribedText}</p>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-auto flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetAssessment}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-xl flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all"
            >
              Restart
              <XCircle className="ml-2" size={18} />
            </motion.button>

            {isAssessmentComplete ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={viewFeedback}
                className="flex-1 bg-gradient-to-r from-brand-purple to-brand-blue text-white py-3 rounded-xl flex items-center justify-center font-medium shadow-md hover:shadow-lg transition-all"
              >
                View Feedback
                <FileText className="ml-2" size={18} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={nextQuestion}
                disabled={!transcribedText}
                className="flex-1 bg-gradient-to-r from-brand-yellow to-brand-orange text-white py-3 rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-all"
              >
                Next Question
                <ChevronRight className="ml-2" size={18} />
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Right Section - Video Preview */}
        <VideoPreview videoRef={videoRef} isRecording={isRecording} />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <Loader className="animate-spin" />
            <span>Processing recording...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default GrammarAssessment;