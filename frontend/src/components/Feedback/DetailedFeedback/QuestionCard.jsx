// src/components/Feedback/DetailedFeedback/QuestionCard.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import IdealAnswerSection from './IdealAnswerSection';
import AssessmentSection from './AssessmentSection';

const QuestionCard = ({
  index,
  question,
  expandedQuestion,
  setExpandedQuestion,
  feedback,
  handleGetIdealAnswer,
  loadingIdealAnswer,
  idealAnswer
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      {/* Question Header */}
      <motion.div
        className="p-6 cursor-pointer"
        onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Question {index + 1}</h2>
          <motion.div
            animate={{ rotate: expandedQuestion === index ? 180 : 0 }}
            className="text-brand-blue"
          >
            ▼
          </motion.div>
        </div>
        <p className="text-gray-700 mt-2">{question}</p>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expandedQuestion === index && feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-6 space-y-4"
          >
            <VideoPlayer videoUrl={feedback.videoUrl} />
            
            <div className="text-gray-600">
              Your answer: {feedback.text}
            </div>

            <IdealAnswerSection 
              question={question}
              answer={feedback.text}
              index={index}
              handleGetIdealAnswer={handleGetIdealAnswer}
              loadingIdealAnswer={loadingIdealAnswer}
              idealAnswer={idealAnswer}
            />

            <AssessmentSection feedback={feedback} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionCard;