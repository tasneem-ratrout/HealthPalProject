import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/ping', (_req, res) => {
  res.json({ ok: true, route: 'auth', time: new Date().toISOString() });
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);

export default router;
