import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../../services/api';
import { ConversationSection } from '../../components/Interview/ConversationSection';
import { VideoSection } from '../../components/Interview/VideoSection';
import { SpeechInput } from '../../components/Interview/SpeechInput';
import { Question, SubmittedAnswer } from '../../components/Interview/types';

interface InterviewProps {
  onComplete: (feedback: any, questions: Question[], answers: SubmittedAnswer[], isStopped?: boolean) => void;
}

const Interview: React.FC<InterviewProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswer[]>([]);
  const [showStopDialog, setShowStopDialog] = useState(false);

  useEffect(() => {
    // Retrieve questions from localStorage
    const storedQuestions = localStorage.getItem('interviewQuestions');
    if (!storedQuestions) {
      setError("No interview questions found. Please set up the interview first.");
      setTimeout(() => {
        navigate('/dashboard/interview');
      }, 3000);
      return;
    }

    try {
      const parsedQuestions = JSON.parse(storedQuestions);
      setQuestions(parsedQuestions);
      setAnswers(new Array(parsedQuestions.length).fill(''));
    } catch (error) {
      console.error('Error parsing questions:', error);
      setError("Error loading interview questions. Please try setting up the interview again.");
      setTimeout(() => {
        navigate('/dashboard/interview');
      }, 3000);
    }
  }, [navigate]);

  const handleTimeUp = useCallback(() => {
    setTimeExpired(true);
    if (isListening) {
      setIsListening(false);
    }
    handleSubmitAnswer();
  }, [isListening]);

  const handleSpeechResult = (text: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = text;
    setAnswers(newAnswers);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleStopInterview = async () => {
    setIsListening(false);
    setIsSubmitting(true);
    try {
      const feedback = await ApiService.getFeedback();
      onComplete(feedback, questions, submittedAnswers, true);
    } catch (error) {
      console.error('Error getting feedback:', error);
      setError(error instanceof Error ? error.message : "Failed to complete the interview. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowStopDialog(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const currentAnswer = answers[currentQuestion];
    
    if (typeof currentAnswer !== 'string' || !currentAnswer.trim()) {
      setError("Answer cannot be empty.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      await ApiService.submitAnswer(currentAnswer.trim(), currentQuestion);

      const newSubmittedAnswer = {
        question: questions[currentQuestion].question,
        answer: currentAnswer.trim()
      };
      setSubmittedAnswers([...submittedAnswers, newSubmittedAnswer]);

      if (currentQuestion === questions.length - 1) {
        const feedback = await ApiService.getFeedback();
        onComplete(feedback, questions, [...submittedAnswers, newSubmittedAnswer]);
      } else {
        setCurrentQuestion(prev => prev + 1);
        setTimeExpired(false);
        setIsListening(false);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setError(error instanceof Error ? error.message : "Failed to submit your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      setIsListening(false);
    };
  }, []);

  if (error && !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-[1920px] mx-auto h-screen grid grid-cols-2 relative">
        {/* Enhanced Stop Interview Button */}
        <button
          onClick={() => setShowStopDialog(true)}
          className="absolute top-4 right-4 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg 
            shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-3 z-10"
          disabled={isSubmitting}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="font-semibold">Stop Interview</span>
        </button>

        {/* Custom Stop Dialog */}
        {showStopDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
                <h2 className="text-xl font-semibold">Stop Interview</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to stop the interview? This action cannot be undone and your progress will be submitted as is.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowStopDialog(false)}
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStopInterview}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg 
                    transition-colors duration-200"
                  disabled={isSubmitting}
                >
                  Yes, stop interview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Left side - Conversation Section */}
        <div className="h-full p-6 border-r border-green-100 bg-white shadow-sm">
          {questions.length > 0 && (
            <ConversationSection
              currentQuestion={currentQuestion}
              questions={questions}
              answer={answers[currentQuestion] || ''}
              isListening={isListening}
              timeExpired={timeExpired}
              onAnswerChange={handleTextChange}
              onSubmit={handleSubmitAnswer}
              onTimeUp={handleTimeUp}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Right side - Video Section */}
        <div className="h-full p-6 bg-green-50/50">
          <VideoSection
            isListening={isListening}
            setIsListening={setIsListening}
            onSpeechResult={handleSpeechResult}
          />
        </div>
      </div>
      
      {error && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 
          bg-red-50 border border-red-200 rounded-lg text-red-700 shadow-lg">
          {error}
        </div>
      )}

      <SpeechInput
        isListening={isListening}
        setIsListening={setIsListening}
        onSpeechResult={handleSpeechResult}
      />
    </div>
  );
};

export default Interview;