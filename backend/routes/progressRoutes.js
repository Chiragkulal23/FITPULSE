import { Router } from "express";
import { protect, attachUser } from "../middleware/authMiddleware.js";
import { getProgress } from "../controllers/progressController.js";

const router = Router();

router.get("/progress", protect, attachUser, getProgress);

export default router;
