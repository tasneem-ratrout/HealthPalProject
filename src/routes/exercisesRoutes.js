import express from "express";
import { getExercises, searchExercise } from "../controllers/exercisesController.js";
const router = express.Router();
router.get("/", getExercises);
router.get("/search/:name", searchExercise);

export default router;
