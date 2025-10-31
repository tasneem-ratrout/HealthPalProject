import express from "express";
import { sendMessage, getMessages } from "../controllers/messages.controller.js";
import { requireAuth } from "../middleware/auth.js"; 

const router = express.Router();

router.post("/", requireAuth, sendMessage);

router.get("/:appointment_id", requireAuth, getMessages);

export default router;
