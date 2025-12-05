import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getAllCases,
  updateCaseStatus,
  deleteCase
} from '../controllers/PatientCaseController.js';

const router = express.Router();
router.get('/patient-cases', requireAuth, getAllCases);
router.patch('/patient-cases/:id/status', requireAuth, updateCaseStatus);
router.delete('/patient-cases/:id', requireAuth, deleteCase);


export default router;
