import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, default: "general" },
    target: { type: Number, required: true },
    progress: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    deadline: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);
