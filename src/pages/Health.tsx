import { useState, useEffect } from "react";
import { fetchDashboard } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Footprints, Droplets, Moon, Heart, Calculator, Flame, Plus, Minus } from "lucide-react";
import { PageTransition, FadeInUp, HoverCard, motion } from "@/components/MotionWrapper";
import { calculateBmi, logWater } from "@/lib/api";
import { toast } from "sonner";

const healthData = {
  steps: 8432, stepsGoal: 10000,
  water: 5, waterGoal: 8,
  sleepHours: 7.2, sleepGoal: 8,
  heartRate: 72, heartRateMin: 58, heartRateMax: 142,
  caloriesBurned: 1850, caloriesGoal: 2200,
};

function RingProgress({ value, max, size = 130, strokeWidth = 12, color, children }: { value: number; max: number; size?: number; strokeWidth?: number; color: string; children?: React.ReactNode }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(225 20% 13%)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export default function HealthPage() {
  const [live, setLive] = useState({ calories: healthData.caloriesBurned, steps: healthData.steps, water: healthData.water });
  const [water, setWater] = useState(healthData.water);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchDashboard();
        if (cancelled || !d) return;
        setLive({
          calories: d.stats?.totalCalories ?? healthData.caloriesBurned,
          steps: d.steps ?? healthData.steps,
          water: typeof d.waterGlasses === "number" ? d.waterGlasses : healthData.water,
        });
        setWater(typeof d.waterGlasses === "number" ? d.waterGlasses : healthData.water);
      } catch { /* keep defaults */ }
    })();
    return () => { cancelled = true; };
  }, []);
  const [bmiWeight, setBmiWeight] = useState("");
  const [bmiHeight, setBmiHeight] = useState("");
  const [bmiResult, setBmiResult] = useState<{ value: number; category: string } | null>(null);
  const [bmiLoading, setBmiLoading] = useState(false);

  const calcBmi = async () => {
    const w = parseFloat(bmiWeight); const h = parseFloat(bmiHeight);
    if (!w || !h) return;
    setBmiLoading(true);
    try {
      const data = await calculateBmi(w, h);
      setBmiResult({ value: data.bmi, category: data.category });
    } catch {
      const hm = h / 100; const bmi = w / (hm * hm);
      const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
      setBmiResult({ value: Math.round(bmi * 10) / 10, category });
    }
    setBmiLoading(false);
  };

  const handleWater = async (delta: number) => {
    const next = Math.max(0, Math.min(healthData.waterGoal, water + delta));
    setWater(next);
    try { await logWater(next); } catch {}
  };

  return (
    <PageTransition>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-bold mb-2">
            HEALTH <span className="gradient-text">EDITION</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">Your daily health dashboard</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 space-y-8 pb-20">
        {/* Activity Rings */}
        <FadeInUp delay={0.1}>
          <div className="glass-card p-8 md:p-10">
            <h2 className="font-heading text-xl font-bold mb-6">Daily Activity</h2>
            <div className="flex flex-wrap justify-center gap-10">
              {[
                { val: live.calories, max: healthData.caloriesGoal, color: "hsl(0 84% 60%)", icon: <Flame className="h-5 w-5 text-destructive mb-1" />, num: live.calories, label: "Calories" },
                { val: live.steps, max: healthData.stepsGoal, color: "hsl(252 96% 67%)", icon: <Footprints className="h-5 w-5 text-primary mb-1" />, num: live.steps.toLocaleString(), label: "Steps" },
                { val: healthData.sleepHours, max: healthData.sleepGoal, color: "hsl(164 100% 42%)", icon: <Moon className="h-5 w-5 text-secondary mb-1" />, num: `${healthData.sleepHours}h`, label: "Sleep" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col items-center">
                  <RingProgress value={r.val} max={r.max} color={r.color}>
                    {r.icon}
                    <p className="text-lg font-bold">{r.num}</p>
                  </RingProgress>
                  <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wider">{r.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Steps */}
          <FadeInUp delay={0.15}>
            <HoverCard>
              <div className="glass-card-hover p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Footprints className="h-5 w-5 text-primary" />
                  <h3 className="font-bold">Steps</h3>
                </div>
                <p className="text-4xl font-heading font-bold">{live.steps.toLocaleString()}</p>
                <div className="mt-3 h-2.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((live.steps / healthData.stepsGoal) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.4 }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{healthData.stepsGoal.toLocaleString()} goal</p>
              </div>
            </HoverCard>
          </FadeInUp>

          {/* Water */}
          <FadeInUp delay={0.2}>
            <HoverCard>
              <div className="glass-card-hover p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold">Water Intake</h3>
                </div>
                <p className="text-4xl font-heading font-bold">{water} <span className="text-lg text-muted-foreground">/ {healthData.waterGoal}</span></p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleWater(-1)} className="rounded-full h-9 w-9 p-0"><Minus className="h-4 w-4" /></Button>
                  <div className="flex gap-1 flex-1 items-center">
                    {Array.from({ length: healthData.waterGoal }, (_, i) => (
                      <motion.div key={i} className={`flex-1 h-8 rounded-md ${i < water ? "bg-blue-400" : "bg-muted/30"}`} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.3 + i * 0.05, duration: 0.3 }} style={{ transformOrigin: "bottom" }} />
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleWater(1)} className="rounded-full h-9 w-9 p-0"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </HoverCard>
          </FadeInUp>

          {/* Sleep */}
          <FadeInUp delay={0.25}>
            <HoverCard>
              <div className="glass-card-hover p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="h-5 w-5 text-secondary" />
                  <h3 className="font-bold">Sleep</h3>
                </div>
                <p className="text-4xl font-heading font-bold">{healthData.sleepHours}h</p>
                <div className="mt-3 h-2.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-secondary rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min((healthData.sleepHours / healthData.sleepGoal) * 100, 100)}%` }} transition={{ duration: 1, delay: 0.4 }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Goal: {healthData.sleepGoal}h · Quality: Good</p>
              </div>
            </HoverCard>
          </FadeInUp>

          {/* Heart Rate */}
          <FadeInUp delay={0.3}>
            <HoverCard>
              <div className="glass-card-hover p-6">
                <div className="flex items-center gap-2 mb-4">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Heart className="h-5 w-5 text-destructive" />
                  </motion.div>
                  <h3 className="font-bold">Heart Rate</h3>
                </div>
                <p className="text-4xl font-heading font-bold">{healthData.heartRate} <span className="text-lg text-muted-foreground">bpm</span></p>
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>Min: {healthData.heartRateMin}</span>
                  <span className="text-foreground font-medium">Resting</span>
                  <span>Max: {healthData.heartRateMax}</span>
                </div>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 30 }, (_, i) => (
                    <motion.div key={i} className="flex-1 bg-destructive/30 rounded-sm" initial={{ height: 4 }} animate={{ height: `${Math.random() * 28 + 8}px` }} transition={{ delay: i * 0.02, duration: 0.4 }} />
                  ))}
                </div>
              </div>
            </HoverCard>
          </FadeInUp>

          {/* BMI */}
          <FadeInUp delay={0.35} className="md:col-span-2">
            <div className="glass-card-hover p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="h-5 w-5 text-primary" />
                <h3 className="font-bold">BMI Calculator</h3>
              </div>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="space-y-1">
                  <Label className="text-xs">Weight (kg)</Label>
                  <Input value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} type="number" placeholder="70" className="bg-muted/30 border-border/30 rounded-xl w-28" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height (cm)</Label>
                  <Input value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} type="number" placeholder="175" className="bg-muted/30 border-border/30 rounded-xl w-28" />
                </div>
                <Button onClick={calcBmi} size="sm" disabled={bmiLoading} className="gradient-btn rounded-xl">{bmiLoading ? "..." : "Calculate"}</Button>
                {bmiResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 px-5 py-3 rounded-xl bg-muted/30">
                    <span className="text-3xl font-heading font-bold">{bmiResult.value}</span>
                    <span className={`text-sm font-semibold ${bmiResult.category === "Normal" ? "text-secondary" : bmiResult.category === "Underweight" ? "text-yellow-400" : "text-destructive"}`}>{bmiResult.category}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </PageTransition>
  );
}
