import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: Number, default: 0 },
    calories: { type: Number, default: 0 },
    steps: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    date: { type: String, required: true },
    notes: { type: String, default: "" },
    mood: { type: String, default: "Good" },
    sportType: { type: String, default: "" },
    exercises: { type: [exerciseSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Workout", workoutSchema);
