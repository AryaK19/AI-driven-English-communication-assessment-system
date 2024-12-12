import { uploadVideo } from './videoService';

export const saveAssessment = async (assessmentData, onProgressUpdate) => {
  const videoUrls = assessmentData.feedback.map(f => f?.videoUrl).filter(Boolean);
  
  if (videoUrls.length === 0) {
    throw new Error('No videos found to upload');
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
    savedAt: new Date().toISOString()
  };

  return assessmentToSave;
};