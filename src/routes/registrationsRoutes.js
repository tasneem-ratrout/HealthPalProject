import express from 'express';
import { registerForWorkshop } from '../controllers/registrationsController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// ✅ تسجيل الورشات
// ⛔ فقط المرضى يقدروا يسجلوا بالورشات
router.post(
  '/register',
  requireAuth,
  authorizeRole('patient'),
  registerForWorkshop
);

export default router;
