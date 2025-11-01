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



// 📦 إضافة دواء أو جهاز (Donor / NGO)
router.post("/items", addMedicalItem);

// 📋 عرض الأدوية والمعدات المتاحة (أي مستخدم)
router.get("/items", getAvailableItems);

// 🙋‍♀️ طلب مساعدة من المريض
router.post("/aid", requestMedicalAid);

// 🏢 NGO توافق أو ترفض الطلب
router.put("/aid/:id/status", updateMedicalAidStatus);

// 🚚 تحديث حالة التوصيل (NGO)
router.put("/aid/:id/delivery", updateDeliveryStatus);

// 👩‍⚕️ عرض طلبات المريض
router.get("/aid/mypatient", getPatientRequests);


export default router;
