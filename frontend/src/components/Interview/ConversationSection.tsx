import React from 'react';
import { Timer } from './Timer';
import { Question } from '../types';

interface ConversationSectionProps {
  currentQuestion: number;
  questions: Question[];
  answer: string;
  isListening: boolean;
  timeExpired: boolean;
  isSubmitting: boolean;
  onAnswerChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onTimeUp: () => void;
}

export const ConversationSection: React.FC<ConversationSectionProps> = ({
  currentQuestion,
  questions,
  answer,
  isListening,
  timeExpired,
  isSubmitting,
  onAnswerChange,
  onSubmit,
  onTimeUp,
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600">
          Question {currentQuestion + 1} of {questions.length}
        </span>
        <Timer duration={1800} onTimeUp={onTimeUp} />
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {questions[currentQuestion].question}
        </h3>
      </div>
      <div className="flex-1 mb-4 min-h-0">
        <textarea
          value={answer}
          onChange={onAnswerChange}
          disabled={timeExpired || isListening || isSubmitting}
          className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder-gray-500"
          placeholder={isListening ? "Listening... Speak your answer" : "Type your answer here..."}
        />
      </div>
      {timeExpired && (
        <p className="text-amber-600 text-sm mb-4">
          Time's up! Your answer has been submitted.
        </p>
      )}
      <button
        onClick={onSubmit}
        disabled={!answer.trim() || timeExpired || isSubmitting}
        className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          currentQuestion === questions.length - 1 ? 'Finish Interview' : 'Next Question'
        )}
      </button>
    </div>
  );
};