import express from "express";
import {
  triggerSOSController,
  getAllSOSHistory,
  getUserSOSHistory
} from "../controllers/sosController.js";

const router = express.Router();

router.post("/trigger", triggerSOSController);
router.get("/history", getAllSOSHistory);
router.get("/history/:userId", getUserSOSHistory);

export default router;




