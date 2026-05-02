import mongoose from "mongoose";

const membershipRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    gymId: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("MembershipRequest", membershipRequestSchema, "membership_requests");
