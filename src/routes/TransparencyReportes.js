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

router.get('/transparency/financial-overview', requireAuth, financialOverview);
router.get('/transparency/donation-tracking', requireAuth, donationTracking);
router.get('/trsansparency/fairness', requireAuth, fairnessReport);
router.get('/transparency/ngo/:id', requireAuth, ngoTransparencyProfile);

export default router;
