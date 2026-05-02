import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Bookmark, BookmarkCheck, Dumbbell, Flame, Apple, Heart, Zap } from "lucide-react";
import { PageTransition, FadeInUp, HoverCard, StaggerContainer, motion } from "@/components/MotionWrapper";

interface Tip {
  id: string; title: string; category: string; summary: string; content: string; icon: string;
}

const tipCategories = ["All", "Gym", "Weight Loss", "Muscle Gain", "Diet", "Cardio", "Motivation"] as const;

const catIcons: Record<string, React.ReactNode> = {
  Gym: <Dumbbell className="h-4 w-4" />, "Weight Loss": <Flame className="h-4 w-4" />,
  "Muscle Gain": <Zap className="h-4 w-4" />, Diet: <Apple className="h-4 w-4" />,
  Cardio: <Heart className="h-4 w-4" />, Motivation: <Zap className="h-4 w-4" />,
};

const catColors: Record<string, string> = {
  Gym: "bg-primary/20 text-primary", "Weight Loss": "bg-destructive/20 text-destructive",
  "Muscle Gain": "bg-secondary/20 text-secondary", Diet: "bg-green-500/20 text-green-400",
  Cardio: "bg-pink-500/20 text-pink-400", Motivation: "bg-yellow-500/20 text-yellow-400",
};

const tips: Tip[] = [
  { id: "1", title: "Progressive Overload", category: "Gym", icon: "🏋️", summary: "Gradually increase weight, reps, or sets to build strength.", content: "Progressive overload is the foundation of strength training. Each week, aim to increase your working weight by 2-5%, add an extra rep, or include an additional set. This constant challenge forces your muscles to adapt and grow stronger." },
  { id: "2", title: "Caloric Deficit for Fat Loss", category: "Weight Loss", icon: "🔥", summary: "Create a 300-500 calorie deficit for sustainable weight loss.", content: "A moderate caloric deficit of 300-500 calories per day leads to about 0.5-1 lb of fat loss per week. Calculate your TDEE and subtract 300-500 calories. Focus on whole foods, lean protein, and vegetables." },
  { id: "3", title: "Protein Timing Matters", category: "Muscle Gain", icon: "💪", summary: "Distribute protein intake across meals for optimal synthesis.", content: "Research shows distributing 1.6-2.2g of protein per kg of bodyweight across 4-5 meals optimizes muscle protein synthesis. Include 20-40g of protein per meal." },
  { id: "4", title: "Hydration and Performance", category: "Diet", icon: "💧", summary: "Even 2% dehydration can reduce exercise performance.", content: "Drink 500ml of water 2 hours before exercise, sip throughout your workout, and rehydrate with 150% of fluid lost post-exercise. Aim for 3-4 liters daily." },
  { id: "5", title: "Zone 2 Cardio Benefits", category: "Cardio", icon: "❤️", summary: "Low-intensity cardio builds your aerobic base and aids recovery.", content: "Zone 2 cardio (60-70% max heart rate) improves mitochondrial function, fat oxidation, and cardiovascular health. Aim for 150-180 minutes per week." },
  { id: "6", title: "Compound Movements First", category: "Gym", icon: "🏋️", summary: "Start workouts with big lifts like squats, bench, and deadlifts.", content: "Begin every workout with compound movements when your energy and focus are highest. Follow with isolation exercises to target specific muscles." },
  { id: "7", title: "Sleep is Recovery", category: "Motivation", icon: "😴", summary: "7-9 hours of quality sleep is essential for muscle recovery.", content: "During deep sleep, your body releases growth hormone, repairs muscle tissue, and consolidates motor learning. Prioritize 7-9 hours of quality sleep." },
  { id: "8", title: "Meal Prep Consistency", category: "Diet", icon: "🥗", summary: "Preparing meals in advance eliminates guesswork.", content: "Meal prepping 2-3 days of food at once ensures you always have nutritious options. Focus on batch-cooking proteins, complex carbs, and pre-cutting vegetables." },
  { id: "9", title: "Rest Between Sets", category: "Gym", icon: "⏱️", summary: "2-3 min rest for strength, 60-90s for hypertrophy.", content: "For strength (1-5 reps), rest 2-5 minutes. For hypertrophy (8-12 reps), 60-90 seconds. For endurance (15+ reps), under 60 seconds." },
  { id: "10", title: "Start Small, Stay Consistent", category: "Motivation", icon: "🌟", summary: "Consistency beats intensity. Build habits that last.", content: "Start with 3 sessions per week, 30-45 minutes each. The best workout program is one you can stick to long-term." },
  { id: "11", title: "HIIT for Time Efficiency", category: "Cardio", icon: "⚡", summary: "High-intensity intervals burn more calories in less time.", content: "HIIT alternates 20-30 seconds of all-out effort with 60-90 seconds of rest. Limit to 2-3 sessions per week to avoid overtraining." },
  { id: "12", title: "Don't Skip Warm-Up", category: "Gym", icon: "🔥", summary: "5-10 minutes of dynamic warm-up prevents injuries.", content: "Start with 5 minutes of light cardio, followed by dynamic stretches. Then do 2-3 warm-up sets with progressively heavier weights." },
];

export default function TipsPage() {
  const [tipsData, setTipsData] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  useEffect(() => {
    // Static data source for now; kept async-ready for API-backed tips.
    try {
      setTipsData(tips);
      setLoadError("");
    } catch {
      setTipsData([]);
      setLoadError("Unable to load tips");
    } finally {
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(
    () =>
      tipsData.filter((t) => {
        const matchCat = filter === "All" || t.category === filter;
        const matchSearch =
          !search ||
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.summary.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      }),
    [tipsData, filter, search]
  );

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  return (
    <PageTransition>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-bold mb-2">
            FITNESS <span className="gradient-text">TIPS</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg">Expert advice to level up your fitness</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 space-y-6 pb-20">
        <FadeInUp delay={0.1}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tips..." className="pl-12 bg-muted/20 border-border/30 rounded-xl h-12 text-base" />
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="flex gap-2 flex-wrap">
            {tipCategories.map((c) => (
              <motion.button key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${filter === c ? "gradient-btn" : "bg-muted/30 text-muted-foreground border border-border/30"}`}>
                {c !== "All" && catIcons[c]}{c}
              </motion.button>
            ))}
          </div>
        </FadeInUp>

        {loading ? (
          <FadeInUp delay={0.2}>
            <div className="glass-card p-16 text-center">
              <p className="text-muted-foreground text-lg">Loading tips...</p>
            </div>
          </FadeInUp>
        ) : loadError ? (
          <FadeInUp delay={0.2}>
            <div className="glass-card p-16 text-center">
              <p className="text-destructive text-lg">{loadError}</p>
            </div>
          </FadeInUp>
        ) : filtered.length === 0 ? (
          <FadeInUp delay={0.2}>
            <div className="glass-card p-16 text-center">
              <p className="text-muted-foreground text-lg">No tips found. Try a different search or category.</p>
            </div>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tip) => (
              <HoverCard key={tip.id}>
                <motion.button
                  variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                  onClick={() => setSelectedTip(tip)}
                  className="glass-card-hover p-6 text-left group w-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{tip.icon}</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${catColors[tip.category] || "bg-muted text-muted-foreground"}`}>{tip.category}</span>
                    </div>
                    <button onClick={(e) => toggleBookmark(tip.id, e)} className="p-1.5 hover:bg-muted/30 rounded-lg transition-colors">
                      {bookmarked.has(tip.id) ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5 text-muted-foreground" />}
                    </button>
                  </div>
                  <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.summary}</p>
                  <p className="text-sm text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity font-medium">Read more →</p>
                </motion.button>
              </HoverCard>
            ))}
          </StaggerContainer>
        )}

        <Dialog open={!!selectedTip} onOpenChange={(open) => { if (!open) setSelectedTip(null); }}>
          <DialogContent className="max-w-lg bg-card border-border/30 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl flex items-center gap-3">
                <span className="text-2xl">{selectedTip?.icon}</span> {selectedTip?.title}
              </DialogTitle>
            </DialogHeader>
            <div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${catColors[selectedTip?.category || ""] || "bg-muted text-muted-foreground"}`}>{selectedTip?.category}</span>
              <p className="text-muted-foreground leading-relaxed mt-5">{selectedTip?.content}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
