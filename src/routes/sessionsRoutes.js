import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

import { getMentalHealthDoctors, getSessions, bookSession } from '../controllers/sessionsController.js';

const router = express.Router();

router.get('/doctors', requireAuth, getMentalHealthDoctors);

router.get('/', requireAuth, getSessions);

router.post('/', requireAuth, bookSession);
export default router;
