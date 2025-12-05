import express from 'express';
import { requireAuth } from '../middleware/auth.js';

import {
  getAllDonations,
  addDonation,
  deleteDonation,
  getDonationsByCase
} from '../controllers/DonationsController.js';

const router = express.Router();
router.get('/donations', requireAuth, getAllDonations);
router.post('/donations', requireAuth, addDonation);
router.delete('/donations/:id', requireAuth, deleteDonation);
router.get('/donations/case/:case_id', requireAuth, getDonationsByCase);

export default router;
