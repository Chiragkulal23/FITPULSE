import { Workout, Goal, DashboardStats } from "./types";

const workouts: Workout[] = [
  { id: "1", name: "Morning Push Day", category: "Strength", date: new Date(Date.now() - 0 * 86400000).toISOString().split("T")[0], duration: 65, calories: 420, mood: "Great", notes: "Felt strong today", exercises: [{ name: "Bench Press", sets: 4, reps: 8, weight: 80 }, { name: "Shoulder Press", sets: 3, reps: 10, weight: 30 }, { name: "Tricep Dips", sets: 3, reps: 12, weight: 0 }] },
  { id: "2", name: "HIIT Cardio Blast", category: "HIIT", date: new Date(Date.now() - 1 * 86400000).toISOString().split("T")[0], duration: 30, calories: 350, mood: "Good", notes: "", exercises: [] },
  { id: "3", name: "Leg Day", category: "Strength", date: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0], duration: 55, calories: 380, mood: "Tired", notes: "Heavy squats", exercises: [{ name: "Squats", sets: 5, reps: 5, weight: 120 }, { name: "Leg Press", sets: 4, reps: 10, weight: 180 }] },
  { id: "4", name: "5K Run", category: "Cardio", date: new Date(Date.now() - 3 * 86400000).toISOString().split("T")[0], duration: 28, calories: 310, mood: "Great", notes: "New PB!", exercises: [] },
  { id: "5", name: "Yoga Flow", category: "Flexibility", date: new Date(Date.now() - 4 * 86400000).toISOString().split("T")[0], duration: 45, calories: 150, mood: "Good", notes: "", exercises: [] },
  { id: "6", name: "Pull Day", category: "Strength", date: new Date(Date.now() - 5 * 86400000).toISOString().split("T")[0], duration: 60, calories: 400, mood: "Good", notes: "", exercises: [{ name: "Deadlift", sets: 5, reps: 5, weight: 140 }, { name: "Pull-ups", sets: 4, reps: 8, weight: 0 }] },
  { id: "7", name: "Tabata Session", category: "HIIT", date: new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0], duration: 20, calories: 280, mood: "Okay", notes: "", exercises: [] },
  { id: "8", name: "Chest & Arms", category: "Strength", date: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], duration: 50, calories: 360, mood: "Great", notes: "", exercises: [{ name: "Bench Press", sets: 4, reps: 10, weight: 75 }] },
];

const goals: Goal[] = [
  { id: "1", name: "Weekly Workouts", current: 5, target: 6, unit: "workouts", deadline: "2025-12-31" },
  { id: "2", name: "Monthly Calories", current: 8500, target: 12000, unit: "kcal", deadline: "2025-12-31" },
  { id: "3", name: "Bench Press PR", current: 80, target: 100, unit: "kg", deadline: "2025-06-30" },
  { id: "4", name: "Run 100km", current: 67, target: 100, unit: "km", deadline: "2025-12-31" },
];

const stats: DashboardStats = {
  totalWorkouts: 48,
  totalMinutes: 2160,
  totalCalories: 15840,
  currentStreak: 5,
};

export const mockData = { workouts, goals, stats };

// Generate 30 days of progress data
export function generateProgressData() {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      calories: Math.floor(Math.random() * 300 + 150),
      duration: Math.floor(Math.random() * 50 + 15),
    });
  }
  return data;
}
