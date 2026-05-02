import Workout from "../models/Workout.js";
import User from "../models/User.js";

function computeStreak(workouts) {
  const days = new Set(workouts.map((w) => w.date));
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    if (days.has(key)) streak++;
    else {
      if (i === 0) continue;
      break;
    }
  }
  return streak;
}

export async function getDashboard(req, res) {
  try {
    const user = await User.findById(req.userId).select("waterGlasses weight");
    const workouts = await Workout.find({ user: req.userId });
    const totalWorkouts = workouts.length;
    const totalMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);
    const totalCalories = workouts.reduce((s, w) => s + (w.calories || 0), 0);
    const totalSteps = workouts.reduce((s, w) => s + (w.steps || 0), 0);
    const totalDistance = Math.round(workouts.reduce((s, w) => s + (w.distance || 0), 0) * 100) / 100;
    const currentStreak = computeStreak(workouts);

    res.json({
      stats: {
        totalWorkouts,
        totalMinutes,
        totalCalories,
        currentStreak,
      },
      calories: totalCalories,
      steps: totalSteps,
      distance: totalDistance,
      workouts: totalWorkouts,
      streak: currentStreak,
      waterGlasses: user?.waterGlasses ?? 0,
      weightKg: user?.weight ?? 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
