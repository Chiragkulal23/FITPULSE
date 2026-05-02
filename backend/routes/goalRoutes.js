import { Router } from "express";
import { protect, attachUser } from "../middleware/authMiddleware.js";
import { getGoals, createGoal, deleteGoal } from "../controllers/goalController.js";

const router = Router();

router.get("/goals", protect, attachUser, getGoals);
router.post("/goals", protect, attachUser, createGoal);
router.delete("/goals/:id", protect, attachUser, deleteGoal);

export default router;
