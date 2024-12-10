import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/video', async (req, res) => {
  res.json({ message: 'video' })
})

router.post('/video', async (req, res) => {
  res.send("Submitted video");
})

export default router;