import mongoose from "mongoose";
import Question from "./question.model.js";

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question", // Referencing the Question schema
      },
    ],
    dateAndTime: {
      type: Date,
      default: Date.now,
    },
    overallReport: {
      type: String, // or an object for detailed reporting
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Assessment", assessmentSchema);
