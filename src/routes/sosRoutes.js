import express from "express";
import {
  triggerSOSController,
  getAllSOSHistory,
  getUserSOSHistory,
  acceptSOSController
} from "../controllers/sosController.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/trigger", triggerSOSController);
router.get("/history", getAllSOSHistory);
router.get("/history/:userId", getUserSOSHistory);

// 🔥 Doctor accepts SOS (protected)
router.post("/:sosId/accept", requireAuth, acceptSOSController);

export default router;
