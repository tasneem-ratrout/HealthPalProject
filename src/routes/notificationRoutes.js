// src/routes/notificationRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createNotification,
  getAllNotifications,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// ✅ إنشاء تنبيه جديد (Admin only)
router.post('/', requireAuth, createNotification);

// ✅ عرض كل التنبيهات
router.get('/', requireAuth, getAllNotifications);

// ✅ حذف تنبيه
router.delete('/:id', requireAuth, deleteNotification);

export default router;
