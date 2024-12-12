import express from "express";
import User from "../models/User.js";
import Assessment from "../models/Assessment.js";

const router = express.Router();

// Route to save an assessment
router.post("/save", async (req, res) => {
  try {
    const { assessmentData } = req.body;

    console.log("Assessment data ready to save:", assessmentData);

    // Get current user from request headers
    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    // Find the user by email
    const user = await User.findOne({ email: currUserEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Create and save the assessment
    const newAssessment = new Assessment({
      data: JSON.stringify(assessmentData),
    });
    const savedAssessment = await newAssessment.save();

    // Associate the assessment with the user
    user.assessments.push(savedAssessment._id);
    await user.save();

    return res.status(201).json({
      message: "Assessment saved successfully.",
      assessment: savedAssessment,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to delete an assessment
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id: assessmentId } = req.params;

    // Get current user from request headers
    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    // Find the user by email
    const user = await User.findOne({ email: currUserEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the assessment ID exists in the user's assessments
    if (!user.assessments.includes(assessmentId)) {
      return res
        .status(404)
        .json({ error: "Assessment not associated with the user." });
    }

    // Remove the assessment from the database
    await Assessment.findByIdAndDelete(assessmentId);

    // Remove the assessment ID from the user's assessments array
    user.assessments = user.assessments.filter(
      (id) => id.toString() !== assessmentId
    );
    await user.save();

    return res
      .status(200)
      .json({ message: "Assessment deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Route to get data for a specific assessment
router.get("/get/:id", async (req, res) => {
  try {
    const { id: assessmentId } = req.params;

    // Get current user from request headers
    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    // Find the user by email
    const user = await User.findOne({ email: currUserEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the assessment ID exists in the user's assessments
    if (!user.assessments.includes(assessmentId)) {
      return res
        .status(404)
        .json({ error: "Assessment not associated with the user." });
    }

    // Retrieve the assessment from the database
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found." });
    }

    // Return the assessment with its id and other details
    return res.status(200).json({
      assessment: {
        id: assessment._id, // The MongoDB _id is returned as 'id'
        data: assessment.data,
        dateAndTime: assessment.dateAndTime,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/get/all", async (req, res) => {
  try {
    // Get current user from request headers
    const currUserEmail = req.headers["x-user-email"];
    if (!currUserEmail) {
      return res
        .status(400)
        .json({ error: "User email is required in headers." });
    }

    // Find the user by email and populate their assessments
    const user = await User.findOne({ email: currUserEmail }).populate(
      "assessments"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Map over assessments to include the _id (id) and other fields
    const assessmentsWithIds = user.assessments.map((assessment) => ({
      id: assessment._id, // MongoDB _id will be mapped to id
      data: assessment.data,
      dateAndTime: assessment.dateAndTime,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    }));

    // Return the assessments with the ids
    return res.status(200).json({ assessments: assessmentsWithIds });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
