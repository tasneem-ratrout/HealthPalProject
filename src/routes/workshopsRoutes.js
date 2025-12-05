import express from "express";
import {
  createWorkshop,
  getWorkshops,
  getWorkshopById,
  deleteWorkshop,
} from "../controllers/workshopsController.js";

const router = express.Router();

router.post("/", createWorkshop);
router.get("/", getWorkshops);
router.get("/:id", getWorkshopById);
router.delete("/:id", deleteWorkshop);

export default router;
