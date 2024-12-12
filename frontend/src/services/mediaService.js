<<<<<<< HEAD
export const sendMediaToServer = async (mediaBlob, questionIndex, questionText) => {
=======
export const sendMediaToServer = async (mediaBlob, questionIndex) => {
>>>>>>> parent of 2a7344b (commit with deteiled error solved)
  if (!mediaBlob || mediaBlob.size === 0) {
    throw new Error("No recording data available");
  }

  const formData = new FormData();
  formData.append(
    "file",
    mediaBlob,
    `question_${questionIndex}.mp4`
  );
  formData.append("questionIndex", questionIndex);
<<<<<<< HEAD
  
=======
>>>>>>> parent of 2a7344b (commit with deteiled error solved)

  const response = await fetch("http://localhost:8000/process-audio", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${errorText || response.statusText}`);
  }

  const data = await response.json();
  
  if (data.status === "success" && data.text) {
<<<<<<< HEAD
    const feedbackData = await getFeedbackAnalysis(data.text, questionText);
=======
    const feedbackData = await getFeedbackAnalysis(data.text);
>>>>>>> parent of 2a7344b (commit with deteiled error solved)
    return {
      transcribedText: data.text,
      feedback: feedbackData
    };
  } else {
    throw new Error(data.message || "Failed to transcribe audio");
  }
};

<<<<<<< HEAD
export const getFeedbackAnalysis = async (text, questionText) => {
  // console.log("text", text, "questionText", questionText);
=======
export const getFeedbackAnalysis = async (text) => {
>>>>>>> parent of 2a7344b (commit with deteiled error solved)
  const response = await fetch("http://localhost:8000/analyze-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
<<<<<<< HEAD
    body: JSON.stringify({ 
      text,
      questionText
    }),
=======
    body: JSON.stringify({ text }),
>>>>>>> parent of 2a7344b (commit with deteiled error solved)
  });

  if (!response.ok) {
    throw new Error("Failed to get feedback analysis");
  }

  return await response.json();
};