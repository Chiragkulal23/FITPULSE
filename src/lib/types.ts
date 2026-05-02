export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface Workout {
  id: string;
  name: string;
  category: "Strength" | "Cardio" | "HIIT" | "Flexibility" | "Sports" | "Gym";
  date: string;
  duration: number;
  calories: number;
  mood: "Great" | "Good" | "Okay" | "Tired";
  notes: string;
  exercises: Exercise[];
}

export interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline: string;
}

export interface DashboardStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCalories: number;
  currentStreak: number;
}
