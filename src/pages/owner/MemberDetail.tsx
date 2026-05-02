import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { type UserProfile } from "@/contexts/AuthContext";
import { fetchOwnerMember } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flame, Dumbbell, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function getMemberProgress(seed: string) {
  const s = seed.charCodeAt(0) + seed.charCodeAt(1);
  return {
    calories: Array.from({ length: 7 }, (_, i) => ({ day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i], cal: 200 + ((s * (i + 1) * 37) % 400) })),
    strength: Array.from({ length: 6 }, (_, i) => ({
      week: `W${i + 1}`,
      bench: 40 + ((s * (i + 1)) % 40),
      squat: 60 + ((s * (i + 1) * 3) % 50),
    })),
    workouts: Math.floor(15 + (s % 30)),
    totalCalories: Math.floor(8000 + (s * 37) % 10000),
    streak: Math.floor(3 + (s % 15)),
    weightProgress: -Math.floor(1 + (s % 5)),
  };
}

export default function MemberDetail() {
  const { id } = useParams();
  const [member, setMember] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState(() => getMemberProgress(id || "x"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchOwnerMember(id);
        if (cancelled) return;
        if (data?.member) {
          setMember(data.member as UserProfile);
          if (data.progress) {
            setProgress({
              workouts: data.progress.workouts,
              totalCalories: data.progress.totalCalories,
              streak: data.progress.streak,
              weightProgress: data.progress.weightProgress,
              calories: data.progress.calories,
              strength: data.progress.strength,
            });
          }
        } else {
          setMember(null);
        }
      } catch {
        if (!cancelled) {
          setMember(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const tooltipStyle = { backgroundColor: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 15%)", borderRadius: "12px", color: "hsl(0 0% 95%)" };

  const stats = useMemo(
    () => [
      { label: "Workouts", value: progress.workouts, icon: Dumbbell },
      { label: "Calories Burned", value: progress.totalCalories.toLocaleString(), icon: Flame },
      { label: "Streak", value: `${progress.streak} days`, icon: Zap },
      { label: "Weight Change", value: `${progress.weightProgress}kg`, icon: TrendingUp },
    ],
    [progress]
  );

  if (loading) {
    return (
      <div className="section-padding max-w-7xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="section-padding max-w-7xl mx-auto text-center py-20">
        <p className="text-muted-foreground">Member not found.</p>
        <Link to="/owner/members" className="text-primary hover:underline mt-4 inline-block">
          ← Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding max-w-7xl mx-auto space-y-6">
      <Link to="/owner/members" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Members
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card border-border/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-primary-foreground">
                {member.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1">
                <h1 className="font-heading text-2xl font-black">{member.name}</h1>
                <p className="text-muted-foreground text-sm">{member.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
              {[
                { l: "Age", v: member.age },
                { l: "Weight", v: member.weight ? `${member.weight}kg` : "-" },
                { l: "Height", v: member.height ? `${member.height}cm` : "-" },
                { l: "Goal", v: member.goal },
                { l: "Joined", v: member.joinDate },
              ].map((d) => (
                <div key={d.l} className="bg-muted/20 rounded-xl p-3 text-center">
                  <div className="text-xs text-muted-foreground">{d.l}</div>
                  <div className="font-bold text-sm mt-1">{d.v || "-"}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-black">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="font-heading text-lg">Weekly Calories</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progress.calories}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis dataKey="day" stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <YAxis stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="cal" fill="hsl(0 100% 56%)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="font-heading text-lg">Strength Progress</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={progress.strength}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis dataKey="week" stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <YAxis stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="bench" stroke="hsl(0 100% 56%)" strokeWidth={2} dot={{ fill: "hsl(0 100% 56%)", r: 4 }} name="Bench" />
                <Line type="monotone" dataKey="squat" stroke="hsl(24 100% 50%)" strokeWidth={2} dot={{ fill: "hsl(24 100% 50%)", r: 4 }} name="Squat" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
