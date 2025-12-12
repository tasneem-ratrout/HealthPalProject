// import express from "express";
// import { getSmartSuggestions } from "../controllers/appointmentsController.js";

// const router = express.Router();

// router.get("/suggest", getSmartSuggestions);

// export default router;

import express from "express";
import { getSmartSuggestions } from "../controllers/appointmentsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// 🔥 المريض يطلب اقتراحات المواعيد
router.get("/suggest", requireAuth, getSmartSuggestions);

export default router;
