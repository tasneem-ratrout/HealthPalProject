import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  addInventoryItem,
  updateInventory,
  getInventory,
  deleteInventory,
  getInventoryUsageReport,
} from '../controllers/inventoryController.js';

const router = express.Router();

router.post('/inventory', requireAuth, addInventoryItem);
router.patch('/inventory/:id', requireAuth, updateInventory);
router.get('/inventory', requireAuth, getInventory);
router.delete('/inventory/:id', requireAuth, deleteInventory);
router.get('/inventory/usage-report', requireAuth, getInventoryUsageReport);

export default router;
