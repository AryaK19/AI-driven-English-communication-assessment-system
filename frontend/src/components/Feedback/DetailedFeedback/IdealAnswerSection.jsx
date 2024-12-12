// src/components/Feedback/DetailedFeedback/IdealAnswerSection.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IdealAnswerSection = ({
  question,
  answer,
  index,
  handleGetIdealAnswer,
  loadingIdealAnswer,
  idealAnswer
}) => {
  return (
    <>
      <div className="mt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleGetIdealAnswer(question, answer, index)}
          disabled={loadingIdealAnswer[index]}
          className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 text-sm disabled:opacity-50"
        >
          {loadingIdealAnswer[index] ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : 'Show Ideal Answer'}
        </motion.button>
      </div>

      <AnimatePresence>
        {idealAnswer && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-purple-50 p-4 rounded-lg mt-4"
          >
            <h3 className="font-semibold text-brand-purple mb-3">Ideal Answer Analysis</h3>
            <div className="space-y-3">
              {[
                { title: 'Ideal Answer', content: idealAnswer.ideal_answer },
                { title: 'Your Strengths', content: idealAnswer.user_strengths },
                { title: 'Areas for Improvement', content: idealAnswer.areas_for_improvement },
                { title: 'Improvement Suggestions', content: idealAnswer.improvement_suggestions }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h4 className="text-sm font-medium text-gray-700">{item.title}:</h4>
                  <p className="text-sm text-gray-600 mt-1">{String(item.content)}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default IdealAnswerSection;