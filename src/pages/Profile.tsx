import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { PageTransition, FadeInUp } from "@/components/MotionWrapper";
import { User, Mail, Target, Flame, Dumbbell, TrendingUp, Edit2, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchDashboard } from "@/lib/api";
import { toast } from "sonner";

const achievements = [
  { label: "First Workout", icon: Dumbbell, unlocked: true },
  { label: "7-Day Streak", icon: Flame, unlocked: true },
  { label: "100 Workouts", icon: TrendingUp, unlocked: false },
  { label: "Goal Crusher", icon: Target, unlocked: true },
];

export default function ProfilePage() {
  const { logout, user, refreshProfile, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    currentStreak: 0,
  });
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    age: "",
    weight: "",
    height: "",
    goal: "",
  });

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshProfile();
        const dash = await fetchDashboard();
        if (!cancelled && dash?.stats) setStats(dash.stats);
      } catch {
        if (!cancelled) toast.error("Failed to load profile data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfile({
      name: user.name || "",
      email: user.email || "",
      age: user.age ? String(user.age) : "",
      weight: user.weight ? String(user.weight) : "",
      height: user.height ? String(user.height) : "",
      goal: user.goal || "",
    });
  }, [user]);

  const initials = useMemo(
    () => (profile.name ? profile.name.split(" ").map((n) => n[0]).join("") : "U"),
    [profile.name]
  );

  const handleSave = async () => {
    try {
      await updateProfile({
        name: profile.name,
        age: profile.age ? Number(profile.age) : undefined,
        weight: profile.weight ? Number(profile.weight) : undefined,
        height: profile.height ? Number(profile.height) : undefined,
        goal: profile.goal,
      });
      setEditing(false);
    } catch (e: unknown) {
      const message = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (e as { message?: string }).message ||
        "Failed to update profile";
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen px-4 md:px-8 py-12 max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center text-muted-foreground">Loading profile...</div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen px-4 md:px-8 py-12 max-w-5xl mx-auto">
        {/* Header */}
        <FadeInUp>
          <div className="glass-card rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="relative group">
              <Avatar className="h-28 w-28 border-4 border-primary/30">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-foreground" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold font-heading text-foreground">{profile.name}</h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-1">
                <Mail className="h-4 w-4" /> {profile.email}
              </p>
              <p className="text-sm text-primary mt-2 font-semibold uppercase tracking-wider">
                {profile.goal}
              </p>
            </div>

            <Button
              onClick={editing ? handleSave : () => setEditing(true)}
              className="gradient-btn gap-2"
            >
              {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit2 className="h-4 w-4" /> Edit Profile</>}
            </Button>
          </div>
        </FadeInUp>

        {/* Stats Row */}
        <FadeInUp delay={0.1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Workouts", value: stats.totalWorkouts, icon: Dumbbell },
              { label: "Minutes", value: stats.totalMinutes, icon: TrendingUp },
              { label: "Calories", value: stats.totalCalories.toLocaleString(), icon: Flame },
              { label: "Streak", value: `${stats.currentStreak} days`, icon: Target },
            ].map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ y: -4 }}
                className="glass-card rounded-2xl p-5 text-center"
              >
                <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </FadeInUp>

        {/* Profile Details */}
        <FadeInUp delay={0.2}>
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold font-heading text-foreground mb-6">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Full Name", field: "name", icon: User },
                { label: "Email", field: "email", icon: Mail },
                { label: "Age", field: "age", suffix: "years" },
                { label: "Weight", field: "weight", suffix: "kg" },
                { label: "Height", field: "height", suffix: "cm" },
                { label: "Fitness Goal", field: "goal" },
              ].map((item) => (
                <div key={item.field}>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                    {item.label}
                  </label>
                  {editing ? (
                    <Input
                      value={profile[item.field as keyof typeof profile]}
                      onChange={(e) => handleChange(item.field, e.target.value)}
                      className="bg-muted/50 border-border"
                    />
                  ) : (
                    <p className="text-foreground font-medium text-lg">
                      {profile[item.field as keyof typeof profile]}
                      {item.suffix ? ` ${item.suffix}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* Achievements */}
        <FadeInUp delay={0.3}>
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold font-heading text-foreground mb-6">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((a) => (
                <motion.div
                  key={a.label}
                  whileHover={{ scale: 1.05 }}
                  className={`rounded-2xl p-5 text-center border transition-all ${
                    a.unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/30 bg-muted/20 opacity-40"
                  }`}
                >
                  <a.icon className={`h-8 w-8 mx-auto mb-3 ${a.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-sm font-semibold text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.unlocked ? "Unlocked" : "Locked"}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* Logout */}
        <FadeInUp delay={0.4}>
          <div className="text-center">
            <Button variant="outline" onClick={logout} className="border-destructive/30 text-destructive hover:bg-destructive/10">
              Log Out
            </Button>
          </div>
        </FadeInUp>
      </div>
    </PageTransition>
  );
}
