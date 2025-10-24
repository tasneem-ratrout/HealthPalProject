import express from 'express';
import { createAppointment, getAppointments, updateAppointmentStatus } from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// create appointmint
router.post('/', requireAuth, createAppointment);

// get appointments 
router.get('/', requireAuth, getAppointments);

// Update Appointment Status
router.put('/:id/status', requireAuth, updateAppointmentStatus);

export default router;
