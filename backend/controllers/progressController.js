import Workout from "../models/Workout.js";

export async function getProgress(req, res) {
  try {
    const workouts = await Workout.find({ user: req.userId });
    const byDay = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      byDay.set(key, { date: label, calories: 0, duration: 0 });
    }
    for (const w of workouts) {
      if (!byDay.has(w.date)) continue;
      const row = byDay.get(w.date);
      row.calories += w.calories || 0;
      row.duration += w.duration || 0;
    }
    const series = [...byDay.values()];

    const sportsMap = {};
    for (const w of workouts) {
      if (w.category !== "Sports") continue;
      const label = w.sportType || w.name || "Other";
      sportsMap[label] = (sportsMap[label] || 0) + 1;
    }
    const totalSports = Object.values(sportsMap).reduce((a, b) => a + b, 0) || 1;
    const sportsDistribution = Object.entries(sportsMap).map(([name, count]) => ({
      name,
      value: Math.round((count / totalSports) * 100),
    }));

    res.json({ series, sportsDistribution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
