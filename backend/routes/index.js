
import express from 'express';
import userRoutes from './userRoutes.js';
import uploadRouter from './upload.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/upload', uploadRouter);

export default router;
