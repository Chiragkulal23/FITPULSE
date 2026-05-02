import { useEffect, useMemo, useState } from "react";
import { generateProgressData, mockData } from "@/lib/mockData";
import { fetchProgress, fetchWorkouts } from "@/lib/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Trophy, Flame } from "lucide-react";
import { PageTransition, FadeInUp, HoverCard, StaggerContainer, motion } from "@/components/MotionWrapper";
import type { Workout } from "@/lib/types";
import { toast } from "sonner";

const tooltipStyle = {
  background: "#ea5009ff",
  border: "none",
  borderRadius: 12,
  color: "#ffffff",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)"
};

const defaultSportsDist = [
  { name: "Strength", value: 40, color: "hsl(0 100% 56%)" },
  { name: "Cardio", value: 25, color: "hsl(24 100% 50%)" },
  { name: "HIIT", value: 20, color: "hsl(45 100% 50%)" },
  { name: "Flexibility", value: 15, color: "hsl(340 80% 55%)" },
];

const pieColors = ["hsl(0 100% 56%)", "hsl(24 100% 50%)", "hsl(45 100% 50%)", "hsl(340 80% 55%)", "hsl(200 90% 55%)", "hsl(280 70% 55%)"];

export default function ProgressPage() {
  const [progressData, setProgressData] = useState(() => generateProgressData());
  const [sportsDist, setSportsDist] = useState(defaultSportsDist);
  const [workouts, setWorkouts] = useState<Workout[]>(mockData.workouts);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prog, list] = await Promise.all([fetchProgress(), fetchWorkouts()]);
        if (cancelled) return;
        if (prog?.series?.length) setProgressData(prog.series);
        if (Array.isArray(list) && list.length) setWorkouts(list as Workout[]);
        if (prog?.sportsDistribution?.length) {
          setSportsDist(
            prog.sportsDistribution.map((s: { name: string; value: number }, i: number) => ({
              name: s.name,
              value: s.value,
              color: pieColors[i % pieColors.length],
            }))
          );
        }
      } catch {
        if (!cancelled) toast.error("Could not load progress data");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const records = useMemo(() => {
    const map = new Map<string, number>();
    workouts.forEach((w) => w.exercises.forEach((ex) => {
      if (ex.weight > (map.get(ex.name) || 0)) map.set(ex.name, ex.weight);
    }));
    return Array.from(map.entries()).map(([name, weight]) => ({ name, weight }));
  }, [workouts]);

  const streak = useMemo(() => {
    const days = new Set(workouts.map((w) => w.date));
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (days.has(key)) count++;
      else {
        if (i === 0) continue;
        break;
      }
    }
    return count || mockData.stats.currentStreak;
  }, [workouts]);

  return (
    <PageTransition>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-bold mb-2">
            YOUR <span className="gradient-text">PROGRESS</span>
          </motion.h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 space-y-8 pb-20">
        <FadeInUp delay={0.1}>
          <div className="glass-card p-6 md:p-8 flex items-center gap-5">
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Flame className="h-10 w-10 text-destructive" />
            </motion.div>
            <div>
              <p className="text-3xl font-heading font-bold">{streak} Day Streak</p>
              <p className="text-sm text-muted-foreground">Keep it going! 🔥</p>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeInUp delay={0.15}>
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold mb-6">Calories Burned (30 days)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={progressData}>
                  <CartesianGrid stroke="hsl(0 0% 8%)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#e5e7eb" fontSize={11} tickLine={false} interval={4} />
                  <YAxis stroke="#e5e7eb" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ stroke: "hsl(0 0% 20%)" }}
                  />
                  <defs>
                    <linearGradient id="calGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="hsl(0 100% 56%)" />
                      <stop offset="100%" stopColor="hsl(24 100% 50%)" />
                    </linearGradient>
                  </defs>
                  <Line type="monotone" dataKey="calories" stroke="url(#calGrad)" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="glass-card p-6 md:p-8">
              <h2 className="font-heading text-xl font-bold mb-6">Workout Duration (30 days)</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={progressData}>
                  <CartesianGrid stroke="hsl(0 0% 8%)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#e5e7eb" fontSize={11} tickLine={false} interval={4} />
                  <YAxis stroke="#e5e7eb" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ fill: "hsl(0 0% 15%)" }}
                  />
                  <Bar dataKey="duration" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 100% 56%)" />
                      <stop offset="100%" stopColor="hsl(24 100% 50%)" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeInUp>
        </div>

        <FadeInUp delay={0.25}>
          <div className="glass-card p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold mb-6">Sports Distribution</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width={250} height={250}>
                <PieChart>
                  <Pie
                    data={sportsDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    label={{ fill: "#ffffff", fontSize: 12, fontWeight: 600 }}
                  >
                    {sportsDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-5">
                {sportsDist.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 text-sm">
                    <div className="h-4 w-4 rounded-full" style={{ background: s.color }} />
                    <span className="text-white font-medium">{s.name}</span>
                    <span className="font-bold">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.3}>
          <div className="glass-card p-6 md:p-8">
            <h2 className="font-heading text-xl font-bold mb-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 text-yellow-400" /> Personal Records
            </h2>
            {records.length === 0 ? (
              <p className="text-muted-foreground">No records yet. Log exercises to track PRs!</p>
            ) : (
              <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {records.map((r) => (
                  <HoverCard key={r.name}>
                    <motion.div variants={{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } }} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-yellow-500/30 transition-all">
                      <Trophy className="h-5 w-5 text-yellow-400 shrink-0" />
                      <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-sm text-muted-foreground">{r.weight} kg</p>
                      </div>
                    </motion.div>
                  </HoverCard>
                ))}
              </StaggerContainer>
            )}
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
