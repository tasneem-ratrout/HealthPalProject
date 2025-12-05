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


router.post('/add-details/:id', requireAuth, addNGODetails);

router.put('/update-ngo/:id', requireAuth, updateNGO);

router.delete('/delete-ngo/:id', requireAuth, deleteNGO);

router.get('/ngos', requireAuth, getAllNGOs);

router.get('/search-ngos', requireAuth, searchNGOs);
export default router;