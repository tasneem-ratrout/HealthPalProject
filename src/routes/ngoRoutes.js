// src/routes/ngoRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addNGO ,verifyNGO} from '../controllers/ngoController.js'; // ✅ صح الآن

const router = express.Router();

// ✅ مسار إضافة منظمة جديدة
router.post('/add-ngo', requireAuth, addNGO);
router.patch('/verify-ngo/:id', requireAuth, verifyNGO);

export default router;
