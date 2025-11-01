import express from "express";
import {
  addMedicalItem,
  getAvailableItems,
  requestMedicalAid,
  updateMedicalAidStatus,
  updateDeliveryStatus,
  getPatientRequests,
} from "../controllers/medicalController.js";
import { requireAuth as authenticateUser } from "../middleware/auth.js";

const router = express.Router();


router.use(authenticateUser);


router.post("/items", addMedicalItem);

router.get("/items", getAvailableItems);

router.post("/aid", requestMedicalAid);

router.put("/aid/:id/status", updateMedicalAidStatus);

router.put("/aid/:id/delivery", updateDeliveryStatus);

router.get("/aid/mypatient", getPatientRequests);


export default router;
