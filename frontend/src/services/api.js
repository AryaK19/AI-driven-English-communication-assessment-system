import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const FASTAPI_URL = "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const fastApi = axios.create({
  baseURL: FASTAPI_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get ideal answer and analysis
export const getIdealAnswer = async (question, answer) => {
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
};