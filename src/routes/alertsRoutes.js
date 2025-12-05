import express from 'express';
import {
  getAlerts,
  getAlertById,
  createAlert,
  deleteAlert
} from '../controllers/alertsController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.get('/', getAlerts);
router.get('/:id', getAlertById);

router.post('/', requireAuth, authorizeRole('doctor', 'admin'), createAlert);
router.delete('/:id', requireAuth, authorizeRole('admin'), deleteAlert);
export default router;
