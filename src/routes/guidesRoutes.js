// import express from 'express';
// import { getGuides, getGuideById, createGuide, updateGuide, deleteGuide } from '../controllers/guidesController.js';

// const router = express.Router();

// // ✅ Routes
// router.get('/', getGuides);
// router.get('/:id', getGuideById);
// router.post('/', createGuide);
// router.put('/:id', updateGuide);
// router.delete('/:id', deleteGuide);

// export default router;

import express from 'express';
import {
  getGuides,
  getGuideById,
  createGuide,
  updateGuide,
  deleteGuide
} from '../controllers/guidesController.js';

import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

// ✅ عرض الأدلة
router.get('/', getGuides);
router.get('/:id', getGuideById);

// ⛔ فقط الدكتور أو الأدمن يقدروا يضيفوا أو يعدلوا
router.post('/', requireAuth, authorizeRole('doctor', 'admin'), createGuide);
router.put('/:id', requireAuth, authorizeRole('doctor', 'admin'), updateGuide);
router.delete('/:id', requireAuth, authorizeRole('admin'), deleteGuide);

export default router;
