import React from 'react';
import { motion } from 'framer-motion';

const AssessmentSection = ({ feedback }) => {
  const sections = [
    {
      title: 'Answer Assessment',
      hasContent: feedback?.correctness?.score !== undefined || feedback?.correctness?.detailed_feedback,
      score: feedback?.correctness?.score,
      feedback: feedback?.correctness?.detailed_feedback,
      bgColor: 'bg-blue-100',
      textColor: 'text-brand-blue'
    },
    {
      title: 'Grammar Assessment',
      hasContent: feedback?.grammar?.errors?.length > 0 || feedback?.grammar?.error_count > 0,
      errorCount: feedback?.grammar?.error_count,
      errors: feedback?.grammar?.errors || [],
      bgColor: 'bg-red-100',
      textColor: 'text-brand-red'
    },
    {
      title: 'Pronunciation Assessment',
      hasContent: feedback?.pronunciation?.errors?.length > 0 || feedback?.pronunciation?.error_count > 0,
      errorCount: feedback?.pronunciation?.error_count,
      errors: feedback?.pronunciation?.errors || [],
      bgColor: 'bg-purple-100',
      textColor: 'text-brand-purple'
    },
    {
      title: 'Fluency Assessment',
      hasContent: feedback?.fluency?.fluency_score !== undefined || feedback?.fluency?.filler_words?.length > 0,
      score: feedback?.fluency?.fluency_score,
      fillerCount: feedback?.fluency?.filler_word_count,
      fillerWords: feedback?.fluency?.filler_words || [],
      feedback: feedback?.fluency?.feedback,
      bgColor: 'bg-blue-100',
      textColor: 'text-brand-blue'
    },
    {
      title: 'Speech Pauses',
      hasContent: feedback?.pause_count !== undefined,
      count: feedback?.pause_count,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Vocabulary Assessment',
      hasContent: feedback?.vocabulary?.vocabulary_score !== undefined || feedback?.vocabulary?.unique_advanced_words?.length > 0,
      score: feedback?.vocabulary?.vocabulary_score,
      advancedWords: feedback?.vocabulary?.unique_advanced_words || [],
      feedback: feedback?.vocabulary?.feedback,
      bgColor: 'bg-purple-100',
      textColor: 'text-brand-purple'
    }
  ];

  const renderErrors = (errors, isGrammar) => {
    if (!errors || errors.length === 0) return null;
    
    return (
      <ul className="list-disc pl-5 space-y-2">
        {errors.map((error, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-gray-700 text-sm"
          >
            <span className={isGrammar ? 'text-brand-red' : 'font-medium'}>
              {error.word}
            </span>
            {isGrammar ? (
              <span className="text-brand-blue ml-2">→ {error.suggestion}</span>
            ) : (
              <span className="text-brand-blue ml-2">/{error.phonetic}/</span>
            )}
            <p className="text-xs text-gray-600 mt-1">{error.explanation}</p>
          </motion.li>
        ))}
      </ul>
    );
  };

  const renderFluencyContent = (section) => {
    if (!section.fillerWords || section.fillerWords.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-3">
        <p className="text-sm text-gray-700">
          Detected {section.fillerCount} filler words or hesitations
        </p>
        {section.feedback && (
          <p className="text-sm text-gray-600 italic">{section.feedback}</p>
        )}
        <div className="space-y-2">
          {section.fillerWords.map((filler, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-sm bg-blue-50 p-2 rounded"
            >
              <span className="font-medium text-brand-blue">"{filler.word}"</span>
              <p className="text-xs text-gray-600 mt-1">
                Context: "...{filler.context}..."
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderVocabularyContent = (section) => {
    if (!section.advancedWords || section.advancedWords.length === 0) return null;
    
    return (
      <div className="mt-2">
        <div className="flex flex-wrap gap-1.5 mt-2">
          {section.advancedWords.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="inline-block px-2 py-0.5 text-xs bg-purple-50 text-brand-purple rounded"
            >
              {word}
            </motion.span>
          ))}
        </div>
        {section.feedback && (
          <p className="text-xs text-gray-600 mt-2">{section.feedback}</p>
        )}
      </div>
    );
  };

  const renderPauseContent = (section) => (
    <div className="mt-2">
      <p className="text-sm text-gray-700">
        Detected {section.count} pauses in your speech
      </p>
      <p className="text-xs text-gray-600 mt-2">
        {section.count > 8 
          ? 'Consider reducing the number of pauses to improve speech fluency'
          : section.count > 4
          ? 'Moderate number of pauses - your speech flow is acceptable'
          : 'Good speech flow with minimal pauses'}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {sections.map((section, index) => 
        section.hasContent && (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">{section.title}</h3>
              {section.score !== undefined && (
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.score}% score
                </span>
              )}
              {section.errorCount !== undefined && (
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.errorCount} {section.title === 'Grammar Assessment' ? 'mistakes' : 'challenges'}
                </span>
              )}
              {section.count !== undefined && (
                <span className={`${section.bgColor} ${section.textColor} px-2 py-0.5 rounded-full text-xs`}>
                  {section.count} pauses
                </span>
              )}
            </div>

            {section.errors && renderErrors(section.errors, section.title === 'Grammar Assessment')}
            {section.title === 'Fluency Assessment' && renderFluencyContent(section)}
            {section.title === 'Vocabulary Assessment' && renderVocabularyContent(section)}
            {section.title === 'Speech Pauses' && renderPauseContent(section)}
          </motion.div>
        )
      )}
    </div>
  );
};

export default AssessmentSection;