import { Router } from "express";
import { protectOwner } from "../middleware/authMiddleware.js";
import { getMembers, getMemberById, getAnalytics, registerOwner, loginOwner, getOwnerProfile, getRequests, acceptRequest, rejectRequest } from "../controllers/ownerController.js";

const router = Router();

router.post("/owner/register", registerOwner);
router.post("/owner/login", loginOwner);

router.use(protectOwner);

router.get("/owner/profile", getOwnerProfile);
router.get("/owner/members", getMembers);
router.get("/owner/members/:id", getMemberById);
router.get("/owner/analytics", getAnalytics);

router.get("/owner/requests", getRequests);
router.post("/owner/requests/:id/accept", acceptRequest);
router.post("/owner/requests/:id/reject", rejectRequest);

export default router;
