import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUser
    ,deleteUser 
    ,updateUser
    ,toggleUserStatus
    , getAllUsers
    ,resetUserPassword
    ,searchUsers
} from '../controllers/adminController.js';

const router = express.Router();
router.post('/create-user', requireAuth, createUser);
router.delete('/delete-user/:id', requireAuth, deleteUser);
router.put('/update-user/:id', requireAuth, updateUser);
router.patch('/toggle-user/:id', requireAuth, toggleUserStatus);
router.get('/users', requireAuth, getAllUsers);
router.patch('/reset-password/:id', requireAuth, resetUserPassword);
router.get('/search-users', requireAuth, searchUsers);

 export default router;
