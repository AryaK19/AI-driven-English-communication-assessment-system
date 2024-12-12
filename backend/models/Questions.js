import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    answerText: {
      type: String,
    },
    videoUrl: {
      type: String, // URL validation can be added as required
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Question", questionSchema);
