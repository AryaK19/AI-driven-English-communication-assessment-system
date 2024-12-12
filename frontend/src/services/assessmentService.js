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

  //   for (let i = 0; i < videoUrls.length; i++) {
  //     const s3Data = await uploadVideo(videoUrls[i], i);
  //     uploadedUrls.push(s3Data.url);
  //     onProgressUpdate(((i + 1) / videoUrls.length) * 100);
  //   }

  const assessmentToSave = {
    ...assessmentData,
    videoUrls: uploadedUrls,
    savedAt: new Date().toISOString(),
  };

  // Modify the video URL's in assessment with those pushed on AWS

  const dataToStore = JSON.stringify(assessmentData);
  const response = await axios.post(
    `${API_BASE_URL}/assessments/save`,
    {
      assessmentData: dataToStore,
    },
    {
      headers: {
        "x-user-email": localStorage.getItem("currUser")?.email,
      },
    }
  );
  console.log(response);
  return assessmentToSave;
};

// Function to delete an assessment by ID
export const deleteAssessment = async (assessmentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/assessments/delete/${assessmentId}`,
      {
        headers: {
          "x-user-email": localStorage.getItem("currUser")?.email,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

// Function to get a specific assessment by ID
export const getAssessment = async (assessmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/assessments/get/${assessmentId}`,
      {
        headers: {
          "x-user-email": localStorage.getItem("currUser")?.email,
        },
      }
    );
    const { id, data, dateAndTime, createdAt, updatedAt } =
      response.data.assessment;

    return {
      id,
      data,
      dateAndTime,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};

// Function to get all assessments
export const getAllAssessments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/assessments/get/all`, {
      headers: {
        "x-user-email": localStorage.getItem("currUser")?.email,
      },
    });
    return response.data.assessments.map((assessment) => ({
      id: assessment.id, // Using id from the server response
      data: assessment.data,
      dateAndTime: assessment.dateAndTime,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    }));
  } catch (error) {
    throw new Error(error.response?.data?.error || error.message);
  }
};
