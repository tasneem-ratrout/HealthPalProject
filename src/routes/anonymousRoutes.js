import express from 'express';
import { requireAuth } from '../middleware/auth.js'; 
import {
  startAnonymousChat,
  getAnonymousMessages,
  endAnonymousChat,
  getOpenAnonymousChats,
sendAnonymousMessageAsDoctor,
sendAnonymousMessageAsAnonymous

} from '../controllers/anonymousController.js';

const router = express.Router();
router.post('/start', startAnonymousChat);
router.get('/:roomId/messages', getAnonymousMessages);
router.post('/:roomId/end', requireAuth, endAnonymousChat);
// router.post('/:roomId/message', sendAnonymousMessage);
//router.post('/:roomId/message', requireAuth, sendAnonymousMessage);

router.post('/:roomId/message-anon', sendAnonymousMessageAsAnonymous);
router.post('/:roomId/message', requireAuth, sendAnonymousMessageAsDoctor);
router.get('/open', requireAuth, getOpenAnonymousChats);
export default router;
