// src/routes/ngoRoutes.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
  
  addNGODetails,
  updateNGO,
  deleteNGO,
  getAllNGOs,
  searchNGOs,

} from '../controllers/ngoController.js';

const router = express.Router();


// ✅ إضافة تفاصيل إضافية لمنظمة
router.post('/add-details/:id', requireAuth, addNGODetails);

// ✅ تحديث بيانات منظمة
router.put('/update-ngo/:id', requireAuth, updateNGO);

// ✅ حذف منظمة
router.delete('/delete-ngo/:id', requireAuth, deleteNGO);

// ✅ عرض كل المنظمات
router.get('/ngos', requireAuth, getAllNGOs);

// ✅ بحث عن منظمة
router.get('/search-ngos', requireAuth, searchNGOs);


<<<<<<< HEAD

export default router;
=======
const router = express.Router();

router.post('/add-ngo', requireAuth, addNGO);
router.patch('/verify-ngo/:id', requireAuth, verifyNGO);

export default router;


>>>>>>> ecab8e8ffec35cab5d372c36aecc371e39b949d8
