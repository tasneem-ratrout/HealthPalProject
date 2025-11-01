import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { 
    addMission
    ,updateMission
    ,deleteMission
    ,searchMission
    ,getAllMissions
    ,changeMissionStatus
    
 } from '../controllers/missionController.js';

const router = express.Router();

router.post('/', requireAuth, addMission);
router.put('/update/:id', requireAuth, updateMission);
router.delete('/:id', requireAuth, deleteMission);
router.get('/search', requireAuth, searchMission);
router.get('/', requireAuth, getAllMissions);
router.patch('/status/:id', requireAuth, changeMissionStatus);

export default router;
