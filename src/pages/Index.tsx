import { useEffect, useMemo, useState } from "react";
import type { Workout } from "@/lib/types";
import { fetchDashboard, fetchWorkouts } from "@/lib/api";
import { Activity, Clock, Flame, Zap, Play, ArrowRight, Dumbbell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { PageTransition, FadeInUp, HoverCard, StaggerContainer, motion } from "@/components/MotionWrapper";
import heroImg from "@/assets/hero-gym.jpg";
import { toast } from "sonner";

const catPalette: Record<string, string> = {
  Strength: "hsl(0 100% 56%)",
  Cardio: "hsl(24 100% 50%)",
  HIIT: "hsl(45 100% 50%)",
  Flexibility: "hsl(340 80% 55%)",
  Sports: "hsl(200 90% 55%)",
  Gym: "hsl(280 70% 55%)",
};

const moodEmoji: Record<string, string> = { Great: "🔥", Good: "💪", Okay: "👍", Tired: "😴" };

const quickStarts = [
  { label: "Gym Workout", icon: "🏋️", route: "/gym" },
  { label: "Run", icon: "🏃", route: "/sports" },
  { label: "Yoga", icon: "🧘", route: "/sports" },
  { label: "HIIT", icon: "⚡", route: "/sports" },
];

function ActivityRing({ value, max, size = 100, strokeWidth = 10, color, label }: { value: number; max: number; size?: number; strokeWidth?: number; color: string; label: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(0 0% 8%)" strokeWidth={strokeWidth} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-base font-bold">{Math.round(progress * 100)}%</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    currentStreak: 0,
  });
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashExtras, setDashExtras] = useState({ calories: 0, steps: 0, totalMinutes: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash, list] = await Promise.all([fetchDashboard(), fetchWorkouts()]);
        if (cancelled) return;
        if (dash?.stats) setStats(dash.stats);
        setDashExtras({
          calories: dash?.calories ?? dash?.stats?.totalCalories ?? 0,
          steps: dash?.steps ?? 0,
          totalMinutes: dash?.stats?.totalMinutes ?? 0,
        });
        if (Array.isArray(list)) setWorkouts(list as Workout[]);
        setError("");
      } catch {
        if (!cancelled) {
          setError("Could not load dashboard data");
          toast.error("Could not load live dashboard data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statCards = useMemo(
    () => [
      { label: "Total Workouts", value: stats.totalWorkouts, icon: Activity, gradient: "from-primary/20 to-primary/5" },
      { label: "Total Minutes", value: stats.totalMinutes.toLocaleString(), icon: Clock, gradient: "from-secondary/20 to-secondary/5" },
      { label: "Total Calories", value: stats.totalCalories.toLocaleString(), icon: Flame, gradient: "from-destructive/20 to-destructive/5" },
      { label: "Current Streak", value: `${stats.currentStreak} days`, icon: Zap, gradient: "from-yellow-500/20 to-yellow-500/5" },
    ],
    [stats]
  );

  const weeklyData = useMemo(() => {
    const out: { day: string; workouts: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });
      const c = workouts.filter((w) => w.date === key).length;
      out.push({ day: label, workouts: c });
    }
    return out;
  }, [workouts]);

  const categoryData = useMemo(() => {
    const names = ["Strength", "Cardio", "HIIT", "Flexibility", "Sports", "Gym"] as const;
    return names
      .map((name) => ({
        name,
        value: workouts.filter((w) => w.category === name).length,
        color: catPalette[name] || "hsl(0 0% 40%)",
      }))
      .filter((x) => x.value > 0);
  }, [workouts]);

  const pieData = categoryData.length ? categoryData : [{ name: "None", value: 1, color: "hsl(0 0% 25%)" }];

  const ringCal = dashExtras.calories || stats.totalCalories;
  const ringWork = stats.totalWorkouts;
  const ringMin = dashExtras.totalMinutes || stats.totalMinutes;

  return (
    <PageTransition>
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Gym" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary font-heading font-semibold text-sm uppercase tracking-[0.3em] mb-4"
            >
              Smart Fitness Tracker
            </motion.p>
            <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6">
              TRACK.<br />
              <span className="gradient-text">TRAIN.</span><br />
              TRANSFORM.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8 max-w-md leading-relaxed">
              Your ultimate fitness companion. Monitor workouts, track progress, and crush your goals.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/workouts")}
                className="gradient-btn px-8 py-4 text-base flex items-center gap-2"
              >
                <Dumbbell className="h-5 w-5" /> Start Workout
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/progress")}
                className="px-8 py-4 rounded-full border border-border/50 text-foreground font-semibold hover:bg-muted/20 transition-all flex items-center gap-2"
              >
                View Progress <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-2">Your Overview</h2>
            <p className="text-muted-foreground mb-10">Today&apos;s fitness snapshot</p>
          </FadeInUp>

          {loading ? (
            <div className="glass-card p-10 text-center">
              <p className="text-muted-foreground">Loading dashboard...</p>
            </div>
          ) : error ? (
            <div className="glass-card p-10 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
              <FadeInUp delay={0.1}>
                <div className="glass-card p-8 flex items-center justify-center gap-8">
                  <ActivityRing value={ringCal} max={Math.max(2200, ringCal)} color="hsl(0 100% 56%)" label="Calories" />
                  <ActivityRing value={ringWork} max={Math.max(60, ringWork)} color="hsl(24 100% 50%)" label="Workouts" />
                  <ActivityRing value={ringMin} max={Math.max(2500, ringMin)} color="hsl(45 100% 50%)" label="Minutes" />
                </div>
              </FadeInUp>
              <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s) => (
                  <HoverCard key={s.label}>
                    <motion.div
                      variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                      className={`glass-card-hover p-6 bg-gradient-to-br ${s.gradient}`}
                    >
                      <s.icon className="h-6 w-6 text-primary mb-3" />
                      <p className="text-3xl font-heading font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{s.label}</p>
                    </motion.div>
                  </HoverCard>
                ))}
              </StaggerContainer>
            </div>
          )}
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <FadeInUp delay={0.2}>
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">Quick Start</h2>
            <div className="flex gap-4 flex-wrap">
              {quickStarts.map((q) => (
                <HoverCard key={q.label}>
                  <button
                    onClick={() => navigate(q.route)}
                    className="glass-card-hover px-6 py-4 flex items-center gap-3"
                  >
                    <span className="text-2xl">{q.icon}</span>
                    <span className="font-medium">{q.label}</span>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </button>
                </HoverCard>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <FadeInUp delay={0.3} className="lg:col-span-2">
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold mb-6">Weekly Activity</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="hsl(0 0% 35%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(0 0% 35%)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "hsla(0, 88%, 56%, 1.00)", border: "1px solid hsl(0 0% 12%)", borderRadius: 12, color: "#fff" }} cursor={{ fill: "hsl(0 0% 10%)" }} />
                  <Bar dataKey="workouts" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 100% 56%)" />
                      <stop offset="100%" stopColor="hsl(24 100% 50%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.4}>
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold mb-6">Categories</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsla(187, 89%, 51%, 1.00)", border: "1px solid hsl(0 0% 12%)", borderRadius: 12, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {pieData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      <section className="section-padding pt-0">
        <div className="max-w-7xl mx-auto">
          <FadeInUp delay={0.5}>
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold mb-6">Recent Workouts</h2>
              <div className="space-y-3">
                {workouts.slice(0, 5).map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all duration-200 border border-transparent hover:border-border/30"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xl">{moodEmoji[w.mood] || "💪"}</span>
                      <div>
                        <p className="font-semibold">{w.name}</p>
                        <p className="text-xs text-muted-foreground">{w.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="hidden sm:inline px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{w.category}</span>
                      <span>{w.duration} min</span>
                      <span>{w.calories} kcal</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
            <div className="relative z-10">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                Ready to <span className="gradient-text">Transform</span>?
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
                Start your fitness journey today. Track every rep, every step, every goal.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/workouts")}
                className="gradient-btn px-10 py-4 text-lg"
              >
                Get Started Now
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
