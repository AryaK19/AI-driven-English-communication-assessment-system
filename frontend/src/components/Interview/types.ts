export interface Question {
  id: string;
  question: string;
  type?: string;
  category?: string;
  difficulty?: string;
  expectedDuration?: number;
  idealAnswer?: string;
  keywords?: string[];
  rubric?: {
    grammar?: number;
    vocabulary?: number;
    relevance?: number;
    clarity?: number;
    completeness?: number;
  };
}

export interface SubmittedAnswer {
  question: string;
  answer: string;
  timestamp?: number;
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
}

export interface InterviewFeedback {
  overallScore: number;
  grammarScore?: number;
  vocabularyScore?: number;
  fluencyScore?: number;
  pronunciationScore?: number;
  detailedFeedback: {
    questionId: string;
    feedback: string;
    score: number;
    improvements?: string[];
  }[];
}