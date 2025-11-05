// src/routes/workshopsRoutes.js
import express from 'express';
import workshopsController from '../controllers/workshopsController.js';
import { requireAuth } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/authorizeRole.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads/materials');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

router.get('/', workshopsController.list);
router.get('/:id', workshopsController.getById);

router.post('/', requireAuth, authorizeRole('admin','organizer'), workshopsController.create);

router.put('/:id', requireAuth, authorizeRole(['admin','ngo']), workshopsController.update);
router.delete('/:id', requireAuth, authorizeRole(['admin','ngo']), workshopsController.remove);

router.post('/:id/materials', requireAuth, authorizeRole(['admin','ngo']), upload.array('files', 5), workshopsController.uploadMaterials);

router.post('/:id/register', requireAuth, workshopsController.register);
router.post('/:id/cancel', requireAuth, workshopsController.cancelRegistration);

router.get('/:id/attendees', requireAuth, authorizeRole(['admin','ngo']), workshopsController.attendees);
export default router;
