export const sendMediaToServer = async (mediaBlob, questionIndex) => {
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
    const feedbackData = await getFeedbackAnalysis(data.text);
    return {
      transcribedText: data.text,
      feedback: feedbackData
    };
  } else {
    throw new Error(data.message || "Failed to transcribe audio");
  }
};

export const getFeedbackAnalysis = async (text) => {
  const response = await fetch("http://localhost:8000/analyze-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to get feedback analysis");
  }

  return await response.json();
};