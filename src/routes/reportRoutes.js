// src/routes/reportRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  donationsSummary,
  patientCasesReport,
  ngosActivity,
  missionsReport,
  userReport
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/reports/donations-summary', requireAuth, donationsSummary);
router.get('/reports/patient-cases', requireAuth, patientCasesReport);
router.get('/reports/ngos-activity', requireAuth, ngosActivity);
router.get('/reports/missions', requireAuth, missionsReport);
router.get('/reports/user/:id', requireAuth, userReport);

export default router;
