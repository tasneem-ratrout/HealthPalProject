import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/ping', (_req, res) => {
  res.json({ ok: true, route: 'auth', time: new Date().toISOString() });
});

// ✅ Register
router.post('/register', register);

// ✅ Login
router.post('/login', login);

// ✅ Get current user info (needs token)
router.get('/me', requireAuth, me);

export default router;
