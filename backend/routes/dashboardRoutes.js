import { Router } from "express";
import { protect, attachUser } from "../middleware/authMiddleware.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get("/dashboard", protect, attachUser, getDashboard);

export default router;
