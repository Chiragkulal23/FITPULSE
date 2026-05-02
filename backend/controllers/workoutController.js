import Workout from "../models/Workout.js";
import User from "../models/User.js";
import { calculateWorkoutStats } from "../utils/calculations.js";

function mapWorkout(w) {
  return {
    id: w._id.toString(),
    name: w.name,
    category: w.category,
    date: w.date,
    duration: w.duration,
    calories: w.calories,
    mood: w.mood || "Good",
    notes: w.notes || "",
    exercises: w.exercises || [],
    steps: w.steps,
    distance: w.distance,
    sportType: w.sportType || "",
  };
}

export async function getWorkouts(req, res) {
  try {
    const list = await Workout.find({ user: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json(list.map(mapWorkout));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function saveWorkout(req, res) {
  try {
    const body = req.body;
    const date = body.date || new Date().toISOString().split("T")[0];
    const category = body.category || "Strength";
    const mood = body.mood || "Good";
    const exercises = Array.isArray(body.exercises) ? body.exercises : [];
    const duration = Number(body.duration) || 0;
    const calories = Number(body.calories) || 0;
    const steps = Number(body.steps) || 0;
    const distance = Number(body.distance) || 0;
    const notes = typeof body.notes === "string" ? body.notes : "";
    const sportType = body.type || body.sportType || "";

    if (body.id) {
      const existing = await Workout.findOne({ _id: body.id, user: req.userId });
      if (!existing) return res.status(404).json({ message: "Workout not found" });
      existing.name = body.name || existing.name;
      existing.category = category;
      existing.date = date;
      existing.duration = duration;
      existing.calories = calories;
      existing.steps = steps;
      existing.distance = distance;
      existing.notes = notes;
      existing.mood = mood;
      existing.exercises = exercises;
      existing.sportType = sportType;
      await existing.save();
      return res.json(mapWorkout(existing));
    }

    const created = await Workout.create({
      user: req.userId,
      name: body.name || "Workout",
      category,
      date,
      duration,
      calories,
      steps,
      distance,
      notes,
      mood,
      exercises,
      sportType,
    });
    res.status(201).json(mapWorkout(created));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

export async function deleteWorkout(req, res) {
  try {
    const { id } = req.params;
    const result = await Workout.deleteOne({ _id: id, user: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function calculateWorkout(req, res) {
  try {
    const { sport, durationSec, weightKg } = req.body;
    const sec = Number(durationSec) || 0;
    let weight = Number(weightKg);
    if (!weight || weight <= 0) {
      const u = await User.findById(req.userId).select("weight");
      weight = u?.weight > 0 ? u.weight : 70;
    }
    const stats = calculateWorkoutStats({ sport, durationSec: sec, weightKg: weight });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
