import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Timer, Flame, MapPin, Footprints } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, FadeInUp, HoverCard, StaggerContainer, motion } from "@/components/MotionWrapper";
import { calculateWorkout, saveWorkout } from "@/lib/api";

interface Sport {
  id: string; name: string; icon: string; color: string; hasDistance: boolean; caloriesPerMin: number;
}

const sports: Sport[] = [
  { id: "running", name: "Running", icon: "🏃", color: "from-primary/30 to-primary/5", hasDistance: true, caloriesPerMin: 11 },
  { id: "walking", name: "Walking", icon: "🚶", color: "from-secondary/30 to-secondary/5", hasDistance: true, caloriesPerMin: 5 },
  { id: "cycling", name: "Cycling", icon: "🚴", color: "from-yellow-500/30 to-yellow-500/5", hasDistance: true, caloriesPerMin: 8 },
  { id: "cricket", name: "Cricket", icon: "🏏", color: "from-green-500/30 to-green-500/5", hasDistance: false, caloriesPerMin: 6 },
  { id: "football", name: "Football", icon: "⚽", color: "from-primary/30 to-primary/5", hasDistance: true, caloriesPerMin: 10 },
  { id: "basketball", name: "Basketball", icon: "🏀", color: "from-orange-500/30 to-orange-500/5", hasDistance: false, caloriesPerMin: 9 },
  { id: "badminton", name: "Badminton", icon: "🏸", color: "from-pink-500/30 to-pink-500/5", hasDistance: false, caloriesPerMin: 7 },
  { id: "swimming", name: "Swimming", icon: "🏊", color: "from-blue-500/30 to-blue-500/5", hasDistance: true, caloriesPerMin: 10 },
  { id: "hiking", name: "Hiking", icon: "🥾", color: "from-green-600/30 to-green-600/5", hasDistance: true, caloriesPerMin: 7 },
  { id: "yoga", name: "Yoga", icon: "🧘", color: "from-purple-500/30 to-purple-500/5", hasDistance: false, caloriesPerMin: 3 },
  { id: "hiit", name: "HIIT", icon: "⚡", color: "from-destructive/30 to-destructive/5", hasDistance: false, caloriesPerMin: 13 },
];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function SportsPage() {
  const [activeSport, setActiveSport] = useState<Sport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [backendStats, setBackendStats] = useState<{ calories?: number; steps?: number; distance?: number } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || !activeSport) return;
    const poll = setInterval(async () => {
      try {
        const data = await calculateWorkout({ sport: activeSport.id, durationSec: elapsed });
        setBackendStats(data);
      } catch { }
    }, 10000);
    return () => clearInterval(poll);
  }, [isRunning, activeSport, elapsed]);

  const startWorkout = (sport: Sport) => {
    setActiveSport(sport); setElapsed(0); setIsRunning(false); setBackendStats(null);
  };

  const finishWorkout = async () => {
    if (activeSport && elapsed > 0) {
      const cal = backendStats?.calories ?? Math.floor((elapsed / 60) * activeSport.caloriesPerMin);
      toast.success(`${activeSport.name} logged! ${formatTime(elapsed)} — ${cal} kcal`);
      try { await saveWorkout({ name: activeSport.name, category: "Sports", type: activeSport.id, duration: Math.floor(elapsed / 60), calories: cal }); } catch { }
    }
    setIsRunning(false); setElapsed(0); setActiveSport(null); setBackendStats(null);
  };

  const calories = backendStats?.calories ?? (activeSport ? Math.floor((elapsed / 60) * activeSport.caloriesPerMin) : 0);
  const distance = backendStats?.distance ?? (activeSport?.hasDistance ? ((elapsed / 60) * 0.15).toFixed(2) : null);
  const steps = backendStats?.steps ?? (activeSport?.hasDistance ? Math.floor(elapsed * 1.8) : null);

  return (
    <PageTransition>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-bold mb-2">
            SPORTS <span className="gradient-text">EDITION</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">Real-time activity tracking</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pb-20">
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {sports.map((sport) => (
            <HoverCard key={sport.id}>
              <motion.button
                variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                onClick={() => startWorkout(sport)}
                className={`glass-card-hover p-6 text-center group w-full bg-gradient-to-br ${sport.color}`}
              >
                <motion.div
                  className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 bg-background/30"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                  transition={{ duration: 0.4 }}
                >
                  {sport.icon}
                </motion.div>
                <p className="font-bold text-base">{sport.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{sport.caloriesPerMin} kcal/min</p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-primary opacity-0 group-hover:opacity-100 transition-all font-medium">
                  <Play className="h-4 w-4" /> Start
                </div>
              </motion.button>
            </HoverCard>
          ))}
        </StaggerContainer>

        <Dialog open={!!activeSport} onOpenChange={(open) => { if (!open) finishWorkout(); }}>
          <DialogContent className="max-w-sm bg-card border-border/30 rounded-2xl text-center">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl flex items-center justify-center gap-2">
                <span className="text-2xl">{activeSport?.icon}</span> {activeSport?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              <div className="relative w-52 h-52 mb-6">
                <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                  <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(225 20% 13%)" strokeWidth="8" />
                  <motion.circle
                    cx="100" cy="100" r="85" fill="none" stroke="url(#timerGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 85}
                    animate={{ strokeDashoffset: 2 * Math.PI * 85 * (1 - Math.min(elapsed / 3600, 1)) }}
                    transition={{ duration: 1 }}
                  />
                  <defs>
                    <linearGradient id="timerGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(252 96% 67%)" />
                      <stop offset="100%" stopColor="hsl(164 100% 42%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-heading font-bold tracking-wider">{formatTime(elapsed)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{isRunning ? "Active" : elapsed > 0 ? "Paused" : "Ready"}</p>
                </div>
              </div>
              <div className="flex gap-8 mb-8">
                <div className="text-center">
                  <Flame className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <p className="text-2xl font-bold">{calories}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">kcal</p>
                </div>
                <div className="text-center">
                  <Timer className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold">{Math.floor(elapsed / 60)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">min</p>
                </div>
                {distance && (
                  <div className="text-center">
                    <MapPin className="h-5 w-5 text-secondary mx-auto mb-1" />
                    <p className="text-2xl font-bold">{distance}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">km</p>
                  </div>
                )}
                {steps !== null && (
                  <div className="text-center">
                    <Footprints className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold">{steps}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">steps</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button size="lg" onClick={() => setIsRunning(!isRunning)} className={`rounded-full w-16 h-16 ${isRunning ? "bg-yellow-500 hover:bg-yellow-600" : "gradient-btn"}`}>
                    {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
                  </Button>
                </motion.div>
                {elapsed > 0 && (
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button size="lg" variant="outline" onClick={finishWorkout} className="rounded-full w-16 h-16 border-destructive text-destructive hover:bg-destructive/10">
                      <Square className="h-6 w-6" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
