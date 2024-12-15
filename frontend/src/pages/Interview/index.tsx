  import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import InterviewSetup from './InterviewSetup';
import Interview from './interview';
import { Question, InterviewFeedback, SubmittedAnswer } from '../../components/Interview/types';

const InterviewRoutes: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

  const handleInterviewComplete = (
    feedback: InterviewFeedback,
    questions: Question[],
    answers: SubmittedAnswer[],
    isStopped?: boolean
  ) => {
    setFeedback(feedback);
    // Navigate to feedback page or handle completion
    navigate('/dashboard/assessment/feedback', {
      state: { feedback, questions, answers, isStopped }
    });
  };

  return (
    <Routes>
      <Route index element={<InterviewSetup />} />
      <Route 
        path="start" 
        element={
          <Interview 
            onComplete={handleInterviewComplete}
          />
        } 
      />
    </Routes>
  );
};

export default InterviewRoutes;