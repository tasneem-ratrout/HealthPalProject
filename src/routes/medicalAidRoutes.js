import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addMedicalAid,
  getAllMedicalAids,
  updateMedicalAid,
  deleteMedicalAid,
} from '../controllers/medicalAidController.js';

const router = express.Router();

router.post('/medical-aid', requireAuth, addMedicalAid);
router.get('/medical-aid', requireAuth, getAllMedicalAids);
router.patch('/medical-aid/:id', requireAuth, updateMedicalAid);
router.delete('/medical-aid/:id', requireAuth, deleteMedicalAid);

export default router;
