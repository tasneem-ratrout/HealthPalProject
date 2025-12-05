// src/routes/transparencyRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  financialOverview,
  donationTracking,
  fairnessReport,
  ngoTransparencyProfile
} from '../controllers/transparencyController.js';

const router = express.Router();
router.get('/financial-overview', requireAuth, financialOverview);
router.get('/donation-tracking', requireAuth, donationTracking);
router.get('/fairness', requireAuth, fairnessReport);
router.get('/ngo/:id', requireAuth, ngoTransparencyProfile);

export default router;
