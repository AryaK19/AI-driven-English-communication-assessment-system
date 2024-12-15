import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL_API;
const FASTAPI_URL = import.meta.env.VITE_API_FASTAPI_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const fastApi = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

interface SetupData {
  resumeText: string;
  jobDescription?: string;
  domain?: string;
  role?: string;
  experience: string;
  count: number;
}

export class ApiService {
  static async getIdealAnswer(question: string, answer: string) {
    try {
      const response = await fastApi.post('/get-ideal-answer', {
        question,
        answer
      });
      return response.data;
    } catch (error) {
      console.error('Error getting ideal answer:', error);
      throw error;
    }
  }

  static async processAudio(audioFile: File) {
    try {
      const formData = new FormData();
      formData.append('file', audioFile);

      const response = await fastApi.post('/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error processing audio:', error);
      throw error;
    }
  }

  static async getCompleteAnalysis(text: string, question: string | null = null) {
    try {
      const response = await fastApi.post('/analyze-text', {
        text,
        question
      });
      
      if (response.data.status === "error") {
        throw new Error(response.data.message);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting analysis:', error);
      throw error;
    }
  }

  static async checkAnswer(question: string, answer: string) {
    try {
      const response = await fastApi.post('/check-answer', {
        question,
        answer
      });
      return response.data;
    } catch (error) {
      console.error('Error checking answer:', error);
      throw error;
    }
  }

  static async generateQuestions(setupData: SetupData) {
    try {
      const response = await fastApi.post('/generate-questions', setupData);
      return response.data;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  static async submitAnswer(answer: string, questionIndex: number) {
    try {
      const response = await fastApi.post('/submit-answer', {
        answer,
        questionIndex
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  static async getFeedback() {
    try {
      const response = await fastApi.get('/get-feedback');
      return response.data;
    } catch (error) {
      console.error('Error getting feedback:', error);
      throw error;
    }
  }
}

export { api, fastApi };