import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "owner"], default: "user" },
    age: { type: Number },
    weight: { type: Number },
    height: { type: Number },
    goal: { type: String, default: "" },
    waterGlasses: { type: Number, default: 0 },
    gymId: { type: String, default: null },
    membershipStatus: { type: String, enum: ["none", "pending", "approved"], default: "none" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
