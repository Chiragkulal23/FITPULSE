import { Router } from "express";
import { protect, attachUser } from "../middleware/authMiddleware.js";
import { getWorkouts, saveWorkout, deleteWorkout, calculateWorkout } from "../controllers/workoutController.js";

const router = Router();

router.get("/workouts", protect, attachUser, getWorkouts);
router.post("/workout/save", protect, attachUser, saveWorkout);
router.delete("/workouts/:id", protect, attachUser, deleteWorkout);
router.post("/workout/calculate", protect, attachUser, calculateWorkout);

export default router;
