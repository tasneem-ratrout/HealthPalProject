import express from 'express';
import { getGuides, getGuideById, createGuide, updateGuide, deleteGuide } from '../controllers/guidesController.js';

const router = express.Router();

// ✅ Routes
router.get('/', getGuides);
router.get('/:id', getGuideById);
router.post('/', createGuide);
router.put('/:id', updateGuide);
router.delete('/:id', deleteGuide);

export default router;

