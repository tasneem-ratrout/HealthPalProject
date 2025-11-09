import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getMentalHealthDoctors, getSessions, bookSession } from '../controllers/sessionsController.js';

const router = express.Router();

// عرض المعالجين النفسيين
router.get('/doctors', requireAuth, getMentalHealthDoctors);

// عرض الجلسات الخاصة بالمريض الحالي

// ✨ غيّري هذا السطر ↓
router.get('/my', requireAuth, getSessions);
// حجز جلسة جديدة
router.post('/', requireAuth, bookSession);

export default router;
