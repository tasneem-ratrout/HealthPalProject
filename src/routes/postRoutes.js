import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addPost,
  updatePost,
  deletePost,
  getAllPosts,
  searchPosts,
} from '../controllers/postController.js';

const router = express.Router();

router.post('/posts', requireAuth, addPost);
router.put('/posts/:id', requireAuth, updatePost);
router.delete('/posts/:id', requireAuth, deletePost);
router.get('/posts', getAllPosts);
router.get('/posts/search', searchPosts);

export default router;
