import express from "express";
import {
  addDailyHealthLog,
  getWeeklySummary
} from "../controllers/dailyHealthController.js";

const router = express.Router();

router.post("/daily-log", addDailyHealthLog);
router.get("/summary/:userId", getWeeklySummary);

export default router;

