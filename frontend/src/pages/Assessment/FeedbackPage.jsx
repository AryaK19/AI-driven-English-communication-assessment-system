import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getIdealAnswer } from '../../services/api';

const FeedbackPage = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState(null);
  const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);
  const [idealAnswers, setIdealAnswers] = useState({});
  const [loadingIdealAnswer, setLoadingIdealAnswer] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('assessmentFeedback');
    if (storedData) {
      setAssessmentData(JSON.parse(storedData));
    }
  }, []);

  const handleGetIdealAnswer = async (question, answer, index) => {
    try {
      setLoadingIdealAnswer(prev => ({ ...prev, [index]: true }));
      const result = await getIdealAnswer(question, answer);
      
      let parsedData;
      try {
        parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
      } catch (e) {
        console.error('Error parsing ideal answer response try again:', e);
        parsedData = {
          ideal_answer: 'Error parsing response try again...',
          user_strengths: 'Unable to analyze try again...',
          areas_for_improvement: 'Unable to analyze try again...',
          improvement_suggestions: 'Unable to analyze try again...'
        };
      }

      setIdealAnswers(prev => ({
        ...prev,
        [index]: parsedData
      }));
    } catch (error) {
      console.error('Error getting ideal answer:', error);
      setIdealAnswers(prev => ({
        ...prev,
        [index]: {
          ideal_answer: 'Failed to get ideal answer',
          user_strengths: 'Error occurred',
          areas_for_improvement: 'Error occurred',
          improvement_suggestions: 'Please try again later'
        }
      }));
    } finally {
      setLoadingIdealAnswer(prev => ({ ...prev, [index]: false }));
    }
  };

  if (!assessmentData) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-6 text-center"
      >
        <p>No feedback data available.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 bg-brand-blue text-white rounded hover:opacity-90"
        >
          Return to Dashboard
        </motion.button>
      </motion.div>
    );
  }

  // Calculate overall statistics and performance percentages
  const overallStats = assessmentData.feedback.reduce((acc, questionFeedback) => {
    if (questionFeedback) {
      acc.totalGrammarErrors += questionFeedback.grammar.error_count;
      acc.totalPronunciationErrors += questionFeedback.pronunciation.error_count;
      if (questionFeedback.fluency) {
        acc.totalFluencyScore += questionFeedback.fluency.fluency_score;
        acc.totalFillerWords += questionFeedback.fluency.filler_word_count;
        acc.fluencyCount += 1;
      }
      if (questionFeedback.vocabulary) {
        acc.totalVocabularyScore += questionFeedback.vocabulary.vocabulary_score;
        acc.totalAdvancedWords += questionFeedback.vocabulary.total_advanced_words;
        acc.vocabularyCount += 1;
      }
      if (questionFeedback.correctness) {
        acc.totalCorrectnessScore += questionFeedback.correctness.score;
        acc.correctnessCount += 1;
      }
    }
    return acc;
  }, { 
    totalGrammarErrors: 0, 
    totalPronunciationErrors: 0,
    totalFluencyScore: 0,
    totalFillerWords: 0,
    fluencyCount: 0,
    totalVocabularyScore: 0,
    totalAdvancedWords: 0,
    vocabularyCount: 0,
    totalCorrectnessScore: 0,
    correctnessCount: 0
  });

  const totalQuestions = assessmentData.questions.length;
  
  // Calculate performance percentages
  const grammarPerformance = Math.max(0, Math.min(100, 100 - (overallStats.totalGrammarErrors / totalQuestions * 20)));
  const pronunciationPerformance = Math.max(0, Math.min(100, 100 - (overallStats.totalPronunciationErrors / totalQuestions * 20)));
  const fluencyPerformance = overallStats.fluencyCount > 0 
    ? overallStats.totalFluencyScore / overallStats.fluencyCount 
    : 100;
  const vocabularyPerformance = overallStats.vocabularyCount > 0
    ? overallStats.totalVocabularyScore / overallStats.vocabularyCount
    : 50;
  const correctnessPerformance = overallStats.correctnessCount > 0
    ? overallStats.totalCorrectnessScore / overallStats.correctnessCount
    : 0;

  const overallScore = Math.round(
    (grammarPerformance * 0.2) +
    (pronunciationPerformance * 0.2) +
    (fluencyPerformance * 0.2) +
    (vocabularyPerformance * 0.2) +
    (correctnessPerformance * 0.2)
  );

  const getHealthBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-brand-blue';
    if (percentage >= 60) return 'bg-brand-yellow';
    if (percentage >= 40) return 'bg-brand-orange';
    return 'bg-brand-red';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6"
    >
      <motion.h1 
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        Assessment Feedback
      </motion.h1>
      
      {/* Overall Performance Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-md p-6 mb-6 hover:shadow-lg transition-shadow duration-300"
      >
        <h2 className="text-2xl font-semibold mb-4">Overall Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Score - Left Side */}
          <motion.div 
            className="flex flex-col items-center justify-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                    className="text-5xl font-bold text-brand-blue"
                  >
                    {overallScore}
                    <div className="text-sm text-gray-500 mt-1">out of 100</div>
                  </motion.div>
                </div>
              </div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="96"
                  cy="96"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * overallScore) / 100 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-brand-blue"
                  strokeWidth="8"
                  strokeDasharray={440}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="96"
                  cy="96"
                />
              </svg>
            </div>
            <div className="mt-4 text-center">
              <div className="text-lg font-medium text-brand-purple mb-2">
                {getScoreGrade(overallScore)}
              </div>
              <p className="text-sm text-gray-600">
                Based on Grammar, Pronunciation, Fluency, Vocabulary, and Answer Correctness
              </p>
            </div>
          </motion.div>

          {/* Performance Metrics - Right Side */}
          <div className="space-y-4">
            {[
              { label: 'Grammar', performance: grammarPerformance, count: overallStats.totalGrammarErrors, unit: 'mistakes' },
              { label: 'Pronunciation', performance: pronunciationPerformance, count: overallStats.totalPronunciationErrors, unit: 'challenges' },
              { label: 'Fluency', performance: fluencyPerformance, count: overallStats.totalFillerWords, unit: 'filler words' },
              { label: 'Vocabulary', performance: vocabularyPerformance, count: overallStats.totalAdvancedWords, unit: 'advanced words used' },
              { label: 'Answer Correctness', performance: correctnessPerformance, text: 'Based on relevance and completeness' }
            ].map((metric, index) => (
              <motion.div 
                key={metric.label}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="bg-gray-50 p-3 rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-sm font-medium text-gray-800">{metric.label}</h3>
                  <span className="text-xs font-medium text-brand-blue">
                    {metric.performance.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.performance}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                    className={`h-full ${getHealthBarColor(metric.performance)} transition-all duration-500`}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {metric.count !== undefined ? `${metric.count} ${metric.unit}` : metric.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 4px 15px rgba(0,0,0,0.1)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetailedFeedback(!showDetailedFeedback)}
          className="w-full mt-6 px-6 py-3 bg-white border-2 border-brand-blue text-brand-blue rounded-lg 
          hover:bg-brand-blue hover:text-white transition-all duration-300 text-sm font-medium 
          shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {showDetailedFeedback ? (
            <>
              <span>Hide Detailed Feedback</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              <span>Show Detailed Feedback</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Detailed Feedback Section */}
      <AnimatePresence>
        {showDetailedFeedback && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6"
          >
            {assessmentData.questions.map((question, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
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

                <AnimatePresence>
                  {expandedQuestion === index && assessmentData.feedback[index] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-6 space-y-4"
                    >
                      {/* Video Player Section */}
                      {assessmentData.feedback[index].videoUrl && (
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          className="bg-gray-50 p-4 rounded-lg"
                        >
                          <h3 className="font-semibold text-sm mb-2">Your Response Video</h3>
                          <div className="aspect-video w-full max-w-2xl mx-auto bg-black rounded-lg overflow-hidden shadow-lg">
                            <video 
                              src={assessmentData.feedback[index].videoUrl}
                              controls
                              className="w-full h-full object-contain"
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </motion.div>
                      )}

                      <div className="text-gray-600">
                        Your answer: {assessmentData.feedback[index].text}
                      </div>

                      {/* Ideal Answer Button */}
                      <div className="mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleGetIdealAnswer(question, assessmentData.feedback[index].text, index)}
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

                      {/* Ideal Answer Display */}
                      <AnimatePresence>
                        {idealAnswers[index] && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-purple-50 p-4 rounded-lg mt-4"
                          >
                            <h3 className="font-semibold text-brand-purple mb-3">Ideal Answer Analysis</h3>
                            <div className="space-y-3">
                              {[
                                { title: 'Ideal Answer', content: idealAnswers[index].ideal_answer },
                                { title: 'Your Strengths', content: idealAnswers[index].user_strengths },
                                { title: 'Areas for Improvement', content: idealAnswers[index].areas_for_improvement },
                                { title: 'Improvement Suggestions', content: idealAnswers[index].improvement_suggestions }
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

                      {/* Assessment Sections */}
                      {[
                        {
                          title: 'Answer Assessment',
                          content: assessmentData.feedback[index].correctness,
                          score: assessmentData.feedback[index].correctness?.score,
                          feedback: assessmentData.feedback[index].correctness?.detailed_feedback,
                          bgColor: 'bg-blue-100',
                          textColor: 'text-brand-blue'
                        },
                        {
                          title: 'Grammar Assessment',
                          content: assessmentData.feedback[index].grammar,
                          errorCount: assessmentData.feedback[index].grammar.error_count,
                          errors: assessmentData.feedback[index].grammar.errors,
                          bgColor: 'bg-red-100',
                          textColor: 'text-brand-red'
                        },
                        {
                          title: 'Pronunciation Assessment',
                          content: assessmentData.feedback[index].pronunciation,
                          errorCount: assessmentData.feedback[index].pronunciation.error_count,
                          errors: assessmentData.feedback[index].pronunciation.errors,
                          bgColor: 'bg-purple-100',
                          textColor: 'text-brand-purple'
                        },
                        {
                          title: 'Fluency Assessment',
                          content: assessmentData.feedback[index].fluency,
                          score: assessmentData.feedback[index].fluency?.fluency_score,
                          fillerCount: assessmentData.feedback[index].fluency?.filler_word_count,
                          fillerWords: assessmentData.feedback[index].fluency?.filler_words,
                          feedback: assessmentData.feedback[index].fluency?.feedback,
                          bgColor: 'bg-blue-100',
                          textColor: 'text-brand-blue'
                        },
                        {
                          title: 'Vocabulary Assessment',
                          content: assessmentData.feedback[index].vocabulary,
                          score: assessmentData.feedback[index].vocabulary?.vocabulary_score,
                          advancedWords: assessmentData.feedback[index].vocabulary?.unique_advanced_words,
                          feedback: assessmentData.feedback[index].vocabulary?.feedback,
                          bgColor: 'bg-purple-100',
                          textColor: 'text-brand-purple'
                        }
                      ].map((section, sectionIndex) => (
                        section.content && (
                          <motion.div
                            key={sectionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: sectionIndex * 0.1 }}
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
                            </div>
                            
                            {/* Section specific content */}
                            {section.errors && (
                              <ul className="list-disc pl-5 space-y-2">
                                {section.errors.map((error, i) => (
                                  <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="text-gray-700 text-sm"
                                  >
                                    <span className={section.title === 'Grammar Assessment' ? 'text-brand-red' : 'font-medium'}>
                                      {error.word}
                                    </span>
                                    {section.title === 'Grammar Assessment' ? (
                                      <span className="text-brand-blue ml-2">→ {error.suggestion}</span>
                                    ) : (
                                      <span className="text-brand-blue ml-2">/{error.phonetic}/</span>
                                    )}
                                    <p className="text-xs text-gray-600 mt-1">{error.explanation}</p>
                                  </motion.li>
                                ))}
                              </ul>
                            )}
                            
                            {/* Fluency-specific content */}
                            {section.title === 'Fluency Assessment' && section.fillerWords && (
                              <div className="mt-2 space-y-3">
                                <p className="text-sm text-gray-700">
                                  Detected {section.fillerCount} filler words or hesitations
                                </p>
                                {section.feedback && (
                                  <p className="text-sm text-gray-600 italic">
                                    {section.feedback}
                                  </p>
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
                                      <span className="font-medium text-brand-blue">
                                        "{filler.word}"
                                      </span>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Context: "...{filler.context}..."
                                      </p>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Vocabulary-specific content */}
                            {section.title === 'Vocabulary Assessment' && section.advancedWords && (
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
                                  <p className="text-xs text-gray-600 mt-2">
                                    {section.feedback}
                                  </p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex justify-center"
      >
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-all duration-300 text-sm"
        >
          Return to Dashboard
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default FeedbackPage;