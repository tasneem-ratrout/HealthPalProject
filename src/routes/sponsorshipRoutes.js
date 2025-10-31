import express from 'express';
import {
  createPatientCase,
  getAllPatientCases,
  createDonation,
  getMyDonations,
  addReceipt,
  getReceiptsByCase,
  getPatientCases,  
  getTransparencyDashboard
} from '../controllers/sponsorshipController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// patient cases
router.post('/patient-cases', requireAuth, createPatientCase);
router.get('/patient-cases', requireAuth, getAllPatientCases);
router.get('/patients/:id/cases', requireAuth, getPatientCases);

// donations
router.post('/donations', requireAuth, createDonation);
router.get('/donations', requireAuth, getMyDonations);

// receipts
router.post('/receipts', requireAuth, addReceipt);
router.get('/receipts/:case_id', requireAuth, getReceiptsByCase);

//Transparency Dashboard
router.get('/dashboard/transparency', requireAuth, getTransparencyDashboard);

export default router;
