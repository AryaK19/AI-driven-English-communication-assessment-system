// src/components/Feedback/DetailedFeedback/index.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionCard from './QuestionCard';

const DetailedFeedback = ({ 
  showDetailedFeedback, 
  assessmentData,
  expandedQuestion,
  setExpandedQuestion,
  handleGetIdealAnswer,
  loadingIdealAnswer,
  idealAnswers 
}) => {
  return (
    <AnimatePresence>
      {showDetailedFeedback && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {assessmentData.questions.map((question, index) => (
            <QuestionCard
              key={index}
              index={index}
              question={question}
              expandedQuestion={expandedQuestion}
              setExpandedQuestion={setExpandedQuestion}
              feedback={assessmentData.feedback[index]}
              handleGetIdealAnswer={handleGetIdealAnswer}
              loadingIdealAnswer={loadingIdealAnswer}
              idealAnswer={idealAnswers[index]}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DetailedFeedback;