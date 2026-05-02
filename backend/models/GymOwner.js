import mongoose from "mongoose";

const gymOwnerSchema = new mongoose.Schema(
  {
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gymName: { type: String, required: true, trim: true },
    gymAddress: { type: String, trim: true, default: "" },
    gymPhone: { type: String, trim: true, default: "" },
    gymDescription: { type: String, trim: true, default: "" },
    gymId: { type: String, unique: true, sparse: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

gymOwnerSchema.pre("save", function (next) {
  if (!this.gymId) {
    // Generate a simple 6-character gym ID if missing
    this.gymId = "GYM" + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

export default mongoose.model("GymOwner", gymOwnerSchema, "gym_owners");
