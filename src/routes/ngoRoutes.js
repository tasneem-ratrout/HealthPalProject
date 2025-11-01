// src/routes/ngoRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { addNGO ,verifyNGO} from '../controllers/ngoController.js'; 

const router = express.Router();

router.post('/add-ngo', requireAuth, addNGO);
router.patch('/verify-ngo/:id', requireAuth, verifyNGO);

export default router;

