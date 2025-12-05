// src/routes/notificationRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createNotification,
  getAllNotifications,
  
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', requireAuth, createNotification);

router.get('/', requireAuth, getAllNotifications);
router.delete('/:id', requireAuth, deleteNotification);

export default router;
