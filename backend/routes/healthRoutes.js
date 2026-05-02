import { Router } from "express";
import { protect, attachUser } from "../middleware/authMiddleware.js";
import { postBmi, postWater } from "../controllers/healthController.js";

const router = Router();

router.post("/health/bmi", postBmi);
router.post("/health/water", protect, attachUser, postWater);

export default router;
