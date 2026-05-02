import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, ChevronRight, Dumbbell, Flame, Play, Target, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, FadeInUp, motion } from "@/components/MotionWrapper";
import { calculateWorkout, saveWorkout, requestJoinGym } from "@/lib/api";
import GuidedWorkoutSession, { WorkoutPlanStep } from "@/components/GuidedWorkoutSession";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Building2, Info, Clock } from "lucide-react";

type PlanDay = {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  workout: string[];
};

type ExercisePreset = {
  name: string;
  sets: number;
  reps: number;
};

const weeklyPlan: PlanDay[] = [
  { day: "Monday", workout: ["Chest", "Triceps"] },
  { day: "Tuesday", workout: ["Back", "Biceps", "Abs"] },
  { day: "Wednesday", workout: ["Shoulders", "Legs"] },
  { day: "Thursday", workout: ["Chest", "Triceps"] },
  { day: "Friday", workout: ["Back", "Biceps", "Abs"] },
  { day: "Saturday", workout: ["Shoulders", "Legs"] },
  { day: "Sunday", workout: ["Rest"] },
];

const presets: Record<string, ExercisePreset[]> = {
  Chest: [
    { name: "Bench Press", sets: 4, reps: 8 },
    { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
    { name: "Cable Fly", sets: 3, reps: 12 },
  ],
  Triceps: [
    { name: "Tricep Pushdown", sets: 3, reps: 12 },
    { name: "Overhead Extension", sets: 3, reps: 10 },
  ],
  Back: [
    { name: "Deadlift", sets: 5, reps: 5 },
    { name: "Barbell Row", sets: 4, reps: 8 },
    { name: "Pull-ups", sets: 4, reps: 10 },
  ],
  Biceps: [
    { name: "Barbell Curl", sets: 3, reps: 10 },
    { name: "Hammer Curl", sets: 3, reps: 12 },
  ],
  Abs: [
    { name: "Cable Crunch", sets: 3, reps: 15 },
    { name: "Leg Raises", sets: 3, reps: 15 },
  ],
  Shoulders: [
    { name: "Overhead Press", sets: 4, reps: 8 },
    { name: "Lateral Raises", sets: 3, reps: 15 },
    { name: "Rear Delt Fly", sets: 3, reps: 12 },
  ],
  Legs: [
    { name: "Back Squat", sets: 5, reps: 5 },
    { name: "Leg Press", sets: 4, reps: 10 },
    { name: "Romanian Deadlift", sets: 3, reps: 10 },
  ],
};

const muscleColors: Record<string, string> = {
  Chest: "from-primary via-primary/90 to-secondary",
  Triceps: "from-fuchsia-500 to-primary",
  Back: "from-secondary to-primary",
  Biceps: "from-violet-500 to-fuchsia-500",
  Abs: "from-pink-500 to-primary",
  Shoulders: "from-purple-500 to-primary",
  Legs: "from-orange-500 to-red-500",
  Rest: "from-muted to-muted-foreground",
};

const dayIndexMap: Record<PlanDay["day"], number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const completionStorageKey = "gym_weekly_completion";

export default function GymPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [gymIdInput, setGymIdInput] = useState("");
  const [joiningGym, setJoiningGym] = useState(false);

  const [activePlan, setActivePlan] = useState<PlanDay | null>(null);
  const [completedDays, setCompletedDays] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem(completionStorageKey) || "{}") as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  const [estimatedCalories, setEstimatedCalories] = useState<number | null>(null);
  const [loadingCalories, setLoadingCalories] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const todayIndex = new Date().getDay();
  const todayPlan = weeklyPlan.find((item) => dayIndexMap[item.day] === todayIndex);

  useEffect(() => {
    localStorage.setItem(completionStorageKey, JSON.stringify(completedDays));
  }, [completedDays]);

  useEffect(() => {
    if (!activePlan || activePlan.workout.includes("Rest")) {
      setEstimatedCalories(null);
      return;
    }

    let cancelled = false;
    const fetchCalories = async () => {
      setLoadingCalories(true);
      try {
        const primaryMuscle = activePlan.workout[0].toLowerCase();
        const result = await calculateWorkout({ sport: primaryMuscle, durationSec: 45 * 60 });
        if (!cancelled) setEstimatedCalories(result?.calories ?? null);
      } catch {
        if (!cancelled) setEstimatedCalories(280);
      } finally {
        if (!cancelled) setLoadingCalories(false);
      }
    };

    fetchCalories();
    return () => {
      cancelled = true;
    };
  }, [activePlan]);

  const completionPercent = useMemo(() => {
    const trainingDays = weeklyPlan.filter((item) => !item.workout.includes("Rest"));
    const done = trainingDays.filter((item) => completedDays[item.day]).length;
    return Math.round((done / trainingDays.length) * 100);
  }, [completedDays]);

  const completedCount = useMemo(
    () => weeklyPlan.filter((item) => completedDays[item.day]).length,
    [completedDays]
  );

  const activeExercises = useMemo(() => {
    if (!activePlan) return [];
    return activePlan.workout.flatMap((muscle) => presets[muscle] || []);
  }, [activePlan]);

  const handleStartWorkout = (plan: PlanDay) => {
    setActivePlan(plan);
  };

  const workoutPlan: WorkoutPlanStep[] = useMemo(() => {
    if (!activePlan || activePlan.workout.includes("Rest")) return [];
    const plan: WorkoutPlanStep[] = [];
    activeExercises.forEach((ex, idx) => {
      plan.push({ name: ex.name, duration: 60, type: "exercise" });
      if (idx < activeExercises.length - 1) {
        plan.push({ name: "Rest", duration: 30, type: "rest" });
      }
    });
    return plan;
  }, [activePlan, activeExercises]);

  const handleCompleteWorkout = async (actualDurationMin?: number) => {
    if (!activePlan) return;
    if (activePlan.workout.includes("Rest")) {
      setCompletedDays((prev) => ({ ...prev, [activePlan.day]: true }));
      toast.success("Recovery day marked complete");
      setActivePlan(null);
      return;
    }

    try {
      await saveWorkout({
        name: `${activePlan.day} Gym Plan`,
        category: "Gym",
        type: activePlan.workout.join(", "),
        duration: actualDurationMin ?? 45,
        calories: estimatedCalories ?? 280,
        mood: "Good",
        notes: `Weekly plan: ${activePlan.workout.join(" + ")}`,
        exercises: activeExercises.map((exercise) => ({
          ...exercise,
          weight: 0,
        })),
      });
      setCompletedDays((prev) => ({ ...prev, [activePlan.day]: true }));
      toast.success(`${activePlan.day} workout logged`);
      setActivePlan(null);
      navigate("/workouts");
    } catch {
      toast.error("Could not log workout");
    }
  };

  const handleJoinGym = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymIdInput.trim()) return;
    setJoiningGym(true);
    try {
      await requestJoinGym(gymIdInput.trim());
      toast.success("Membership request sent!");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to join gym");
    } finally {
      setJoiningGym(false);
      setGymIdInput("");
    }
  };

  return (
    <PageTransition>
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-3xl md:text-4xl font-semibold mb-2"
          >
            GYM <span className="gradient-text">EDITION</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">
            Follow a structured weekly split like a professional gym schedule.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 space-y-6 pb-16">
        {user?.role === "user" && user?.membershipStatus !== "approved" && (
          <FadeInUp delay={0.05}>
            <div className="glass-card rounded-3xl p-6 border border-border/30 bg-card/60 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-6 w-6 text-primary" />
                    <h2 className="font-heading text-xl md:text-2xl font-bold">Gym Membership</h2>
                  </div>
                  {user?.membershipStatus === "pending" ? (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-secondary" />
                      Your membership request is currently pending owner approval.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Join a gym using a Gym ID to unlock exclusive owner features.
                    </p>
                  )}
                </div>
                
                {user?.membershipStatus !== "pending" && (
                  <form onSubmit={handleJoinGym} className="flex flex-col sm:flex-row gap-3 w-full md:max-w-md">
                    <Input 
                      placeholder="Enter Gym ID (e.g., GYM123)" 
                      value={gymIdInput} 
                      onChange={(e) => setGymIdInput(e.target.value)} 
                      required 
                      className="bg-muted/50 border-border/40 rounded-xl h-12 flex-1" 
                      disabled={joiningGym}
                    />
                    <Button type="submit" className="gradient-btn rounded-xl h-12 px-6" disabled={joiningGym}>
                      {joiningGym ? "Requesting..." : "Join Gym"}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </FadeInUp>
        )}

        {user?.role === "user" && user?.membershipStatus === "approved" && (
           <FadeInUp delay={0.05}>
             <div className="glass-card rounded-3xl p-4 border border-primary/20 bg-primary/5 mb-6 flex items-center gap-3">
               <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
               <p className="text-sm font-medium">You are an approved member of your gym. Enjoy your workouts!</p>
             </div>
           </FadeInUp>
        )}

        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-3xl p-6 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-xl font-bold">Weekly Progress</h2>
              </div>
              <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
              <p className="mt-3 text-2xl font-heading font-semibold">{completionPercent}%</p>
              <p className="text-sm text-muted-foreground">{completedCount} of 7 days completed</p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-5 w-5 text-secondary" />
                <h2 className="font-heading text-xl font-bold">Today&apos;s Focus</h2>
              </div>
              <p className="text-xl font-heading font-semibold">{todayPlan?.day || "Today"}</p>
              <p className="text-muted-foreground mt-2">
                {todayPlan ? todayPlan.workout.join(" + ") : "No workout scheduled"}
              </p>
            </div>

            <div className="glass-card rounded-3xl p-6 border border-border/30">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="font-heading text-xl font-bold">Gym Style</h2>
              </div>
              <p className="text-xl font-heading font-semibold">Push. Pull. Repeat.</p>
              <p className="text-muted-foreground mt-2">
                Strong split, clean structure, recovery built in.
              </p>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className="glass-card rounded-3xl p-4 md:p-5 border border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Dumbbell className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-xl md:text-2xl font-bold">Weekly Workout Plan</h2>
            </div>

            <div className="space-y-2.5">
              {weeklyPlan.map((plan, index) => {
                const isToday = todayIndex === dayIndexMap[plan.day];
                const isCompleted = !!completedDays[plan.day];
                const isRest = plan.workout.includes("Rest");

                return (
                  <motion.div
                    key={plan.day}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -2 }}
                    className={`rounded-3xl border transition-all duration-300 ${
                      isToday
                        ? "border-primary/60 bg-gradient-to-r from-primary/10 via-card/90 to-secondary/10 shadow-[0_0_30px_-12px_hsl(0_100%_56%/0.45)]"
                        : "border-border/30 bg-card/70 hover:border-primary/30"
                    }`}
                  >
                    <div className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="lg:w-56 shrink-0">
                        <div className="flex items-center gap-3">
                          <p className="font-heading text-lg md:text-2xl font-semibold uppercase tracking-wide">
                            {plan.day}
                          </p>
                          {isToday && (
                            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-primary/15 text-primary">
                              Today
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2.5">
                          {plan.workout.map((muscle) => (
                            <span
                              key={`${plan.day}-${muscle}`}
                              className={`px-3 py-1.5 rounded-2xl text-xs md:text-sm font-semibold uppercase tracking-wide bg-gradient-to-r ${
                                muscleColors[muscle] || "from-primary to-secondary"
                              } text-white shadow-lg`}
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {isCompleted && (
                          <div className="flex items-center gap-2 text-secondary font-semibold">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm uppercase tracking-wider">Done</span>
                          </div>
                        )}
                        <Button
                          onClick={() => handleStartWorkout(plan)}
                          className="gradient-btn rounded-2xl px-4 py-5 text-sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {isRest ? "Mark Recovery" : "Start Workout"}
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </FadeInUp>
      </div>

      <Dialog open={!!activePlan} onOpenChange={(open) => !open && setActivePlan(null)}>
        <DialogContent className="max-w-2xl bg-card border-border/30 rounded-3xl p-4 md:p-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl md:text-2xl font-semibold">
              {activePlan?.day} Workout
            </DialogTitle>
          </DialogHeader>

          {activePlan && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {activePlan.workout.map((muscle) => (
                  <span
                    key={muscle}
                    className={`px-3 py-1 rounded-2xl text-xs font-semibold uppercase tracking-wide bg-gradient-to-r ${
                      muscleColors[muscle] || "from-primary to-secondary"
                    } text-white`}
                  >
                    {muscle}
                  </span>
                ))}
              </div>

              {!activePlan.workout.includes("Rest") && (
                <>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-muted/20 border border-border/20 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Duration</p>
                      <p className="text-lg font-heading font-semibold">45 min</p>
                    </div>
                    <div className="rounded-2xl bg-muted/20 border border-border/20 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Calories</p>
                      <p className="text-lg font-heading font-semibold">
                        {loadingCalories ? "..." : estimatedCalories ?? 280}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted/20 border border-border/20 p-3">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Intensity</p>
                      <p className="text-lg font-heading font-semibold">Gym</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-semibold mb-3">Pre-Filled Exercise Logger</h3>
                    <div className="space-y-2">
                      {activeExercises.map((exercise, idx) => (
                        <div
                          key={`${exercise.name}-${idx}`}
                          className="rounded-2xl border border-border/25 bg-muted/20 px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div>
                            <p className="font-medium text-base">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.sets} sets x {exercise.reps} reps
                            </p>
                          </div>
                          <div className="text-xs text-primary font-semibold">
                            Ready to log
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {activePlan.workout.includes("Rest") && (
                <div className="rounded-3xl border border-border/25 bg-muted/20 p-6 text-center">
                  <Flame className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-heading text-2xl font-bold mb-2">Recovery Day</p>
                  <p className="text-muted-foreground">
                    Mobility, stretching, and light movement only.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {activePlan.workout.includes("Rest") ? (
                  <Button onClick={() => handleCompleteWorkout()} className="flex-1 gradient-btn rounded-2xl py-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                ) : (
                  <Button onClick={() => setIsSessionActive(true)} className="flex-1 gradient-btn rounded-2xl py-2 text-sm">
                    <Play className="h-4 w-4 mr-2" />
                    Start Guided Session
                  </Button>
                )}
                <Button variant="outline" onClick={() => setActivePlan(null)} className="flex-1 rounded-2xl py-2 text-sm">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isSessionActive && activePlan && (
        <GuidedWorkoutSession
          workoutPlan={workoutPlan}
          onComplete={(totalDurationSec) => {
            setIsSessionActive(false);
            handleCompleteWorkout(Math.ceil(totalDurationSec / 60));
          }}
          onClose={() => setIsSessionActive(false)}
        />
      )}
    </PageTransition>
  );
}
