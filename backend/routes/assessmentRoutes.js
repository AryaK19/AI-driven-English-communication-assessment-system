import express from 'express';
import Assessment from '../models/Assessment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create new assessment
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      questions,
      feedback,
      setup,
      videoUrls,
      overallScore,
      statistics
    } = req.body;

    const assessment = new Assessment({
      userId: req.user.id, // From auth middleware
      title,
      questions,
      feedback,
      setup,
      videoUrls,
      overallScore,
      statistics
    });

    const savedAssessment = await assessment.save();
    
    // Update user's assessments array
    await req.user.updateOne({
      $push: { assessments: savedAssessment._id }
    });

    res.status(201).json(savedAssessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

// Get user's assessments
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const assessments = await Assessment.find({ userId: req.params.userId })
      .sort({ createdAt: -1 }); // Most recent first
    
    res.json(assessments);
  } catch (error) {
    console.error('Error fetching user assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Get single assessment
router.get('/:id', auth, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Check if user has permission to view this assessment
    if (assessment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to view this assessment' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

export default router;