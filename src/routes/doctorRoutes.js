import express from 'express';
import { getSpecialties, getDoctorsBySpecialty } from '../controllers/doctorController.js';

const router = express.Router();

router.get('/specialties', getSpecialties);

router.get('/specialties/:specialty_id/doctors', getDoctorsBySpecialty);

export default router;
