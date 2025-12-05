import express from 'express';
import {
  createPatientCase,
  getAllPatientCases,
  createDonation,
  getMyDonations,
  addReceipt,
  getReceiptsByCase,
  getPatientCases,  
  getTransparencyDashboard,
  addFeedback,
  addMedicalHistory,      
  getMedicalHistory,
  updateMedicalConsent
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

// Transparency Dashboard
router.get('/dashboard/transparency', requireAuth, getTransparencyDashboard);

// feedback
router.post('/feedback', requireAuth, addFeedback);

// medical history 
router.post('/medical-history', requireAuth, addMedicalHistory);
router.get('/medical-history/:patient_id', requireAuth, getMedicalHistory);
router.patch('/medical-history/consent', requireAuth, updateMedicalConsent); //  موافقة المريض

export default router;
