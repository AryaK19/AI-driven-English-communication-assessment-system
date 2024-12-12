import mongoose from "mongoose";
import Question from "./question.model.js";

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    dateAndTime: {
      type: Date,
      default: Date.now,
    },
    overallFeedback: {
      type: String, // or an object for detailed reporting
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Assessment", assessmentSchema);
