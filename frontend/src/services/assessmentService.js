import { uploadVideo } from "./videoService";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const saveAssessment = async (assessmentData, onProgressUpdate) => {
  const videoUrls = assessmentData.feedback
    .map((f) => f?.videoUrl)
    .filter(Boolean);

  if (videoUrls.length === 0) {
    throw new Error("No videos found to upload");
  }

  const uploadedUrls = [];
  const currUser = JSON.parse(localStorage.getItem("currUser"));
  if (!currUser?.email) {
    throw new Error("User email not found in localStorage");
  }

  const dataToStore = JSON.stringify(assessmentData);

  const response = await axios.post(
    `${API_BASE_URL}/assessments/save`,
    {
      assessmentData: dataToStore,
    },
    {
      headers: {
        "x-user-email": currUser.email,
        "Content-Type": "application/json"
      },
    }
  );

  return {
    ...assessmentData,
    videoUrls: uploadedUrls,
    savedAt: new Date().toISOString(),
  };
};

export const deleteAssessment = async (assessmentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/assessments/${assessmentId}`,
      {
        headers: {
          "x-user-email": JSON.parse(localStorage.getItem("currUser"))?.email,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

export const getAssessment = async (assessmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/assessments/${assessmentId}`,
      {
        headers: {
          "x-user-email": JSON.parse(localStorage.getItem("currUser"))?.email,
        },
      }
    );

    const { id, data, dateAndTime, createdAt, updatedAt } = response.data.assessment;

    // Parse the data if it's a string
    let parsedData;
    try {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    } catch (parseError) {
      console.error('Error parsing assessment data:', parseError);
      throw new Error('Failed to parse assessment data');
    }

    return {
      id,
      data: parsedData,
      dateAndTime,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw new Error(error.response?.data?.error || error.message);
  }
};

export const getAllAssessments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assessments/all`, {
      headers: {
        "x-user-email": JSON.parse(localStorage.getItem("currUser"))?.email,
      },
    });

    return response.data.assessments.map((assessment) => ({
      id: assessment._id || assessment.id,
      data: assessment.data,
      dateAndTime: assessment.dateAndTime,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw new Error(error.response?.data?.error || error.message);
  }
};