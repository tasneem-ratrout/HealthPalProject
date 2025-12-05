import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import {
  createGroup,
  listGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  getMembers,
  postMessage,
  getMessages,
  deleteMessage,
  removeMember
} from '../controllers/supportGroupsController.js';

const router = express.Router();

// عام — عرض المجموعات
router.get('/', requireAuth, listGroups);
router.get('/:id', requireAuth, getGroup);

// فقط Admin أو Moderator ينشئوا مجموعات (أدمن أو دكتور/therapist ممكن يكون moderator)
router.post('/', requireAuth, authorizeRole('admin'), createGroup);

// الانضمام/المغادرة (أي مريض يستطيع الانضمام)
router.post('/:id/join', requireAuth, joinGroup);
router.post('/:id/leave', requireAuth, leaveGroup);

// أعضاء المجموعة (المشرف أو الأعضاء المصرح لهم)
router.get('/:id/members', requireAuth, getMembers);

// الرسائل: إرسال / جلب
router.post('/:id/messages', requireAuth, postMessage);
router.get('/:id/messages', requireAuth, getMessages);

// أدوات إدارة (حذف رسالة أو طرد عضو) - للموديراتور أو الأدمن
router.delete('/:groupId/messages/:messageId', requireAuth, deleteMessage);
router.delete('/:groupId/members/:memberId', requireAuth, removeMember);

export default router;
