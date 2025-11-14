import express from "express";
import { searchDrug } from "../controllers/drugController.js";

const router = express.Router();

router.get("/search", searchDrug);

export default router;
