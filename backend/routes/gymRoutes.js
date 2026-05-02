import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import GymOwner from "../models/GymOwner.js";
import MembershipRequest from "../models/MembershipRequest.js";
import User from "../models/User.js";

const router = Router();

router.post("/gym/request", protect, async (req, res) => {
  try {
    const { gymId } = req.body;
    if (!gymId) {
      return res.status(400).json({ success: false, message: "Gym ID is required" });
    }

    const gymOwner = await GymOwner.findOne({ gymId });
    if (!gymOwner) {
      return res.status(404).json({ success: false, message: "Invalid Gym ID" });
    }

    const userId = req.userId;

    // Check if user already requested
    const existingReq = await MembershipRequest.findOne({ userId, gymId });
    if (existingReq) {
      if (existingReq.status === "pending") {
        return res.status(400).json({ success: false, message: "Membership request already pending" });
      }
      if (existingReq.status === "approved") {
        return res.status(400).json({ success: false, message: "You are already a member of this gym" });
      }
    }

    // Check if user is already approved somewhere else
    const user = await User.findById(userId);
    if (user.membershipStatus === "approved" || user.membershipStatus === "pending") {
       return res.status(400).json({ success: false, message: `You already have a ${user.membershipStatus} membership.` });
    }

    const newReq = await MembershipRequest.create({
      userId,
      gymId,
      status: "pending",
    });

    user.membershipStatus = "pending";
    await user.save();

    return res.status(201).json({ success: true, message: "Membership request sent successfully", request: newReq });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || "Failed to request gym membership" });
  }
});

export default router;
