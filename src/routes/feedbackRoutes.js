import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllFeedback,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();
router.get('/feedback', requireAuth, getAllFeedback);
router.delete('/feedback/:id', requireAuth, deleteFeedback);

export default router;
