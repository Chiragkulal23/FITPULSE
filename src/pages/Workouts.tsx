import { useState, useEffect, useMemo } from "react";
import { Workout, Exercise } from "@/lib/types";
import { fetchWorkouts, saveWorkout, deleteWorkout as deleteWorkoutApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, FadeInUp, HoverCard, StaggerContainer, motion } from "@/components/MotionWrapper";
const categories = ["All", "Strength", "Cardio", "HIIT", "Flexibility", "Sports", "Gym"] as const;
const moods = ["Great", "Good", "Okay", "Tired"] as const;
const moodEmoji: Record<string, string> = { Great: "🔥", Good: "💪", Okay: "👍", Tired: "😴" };
const catColor: Record<string, string> = {
  Strength: "bg-primary/20 text-primary",
  Cardio: "bg-secondary/20 text-secondary",
  HIIT: "bg-yellow-500/20 text-yellow-400",
  Flexibility: "bg-pink-500/20 text-pink-400",
  Sports: "bg-blue-500/20 text-blue-400",
  Gym: "bg-orange-500/20 text-orange-400",
};

const emptyWorkout: Omit<Workout, "id"> = { name: "", category: "Strength", date: new Date().toISOString().split("T")[0], duration: 0, calories: 0, mood: "Good", notes: "", exercises: [] };

const normalizeCategory = (value?: string) => (value || "").trim().toLowerCase();
const canonicalCategoryMap: Record<string, Workout["category"]> = {
  strength: "Strength",
  cardio: "Cardio",
  hiit: "HIIT",
  flexibility: "Flexibility",
  sports: "Sports",
  gym: "Gym",
};

const normalizeWorkout = (workout: Workout): Workout => {
  const normalized = canonicalCategoryMap[normalizeCategory(workout.category)];
  return {
    ...workout,
    category: normalized || "Gym",
  };
};

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [form, setForm] = useState<Omit<Workout, "id">>(emptyWorkout);

  const loadWorkouts = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchWorkouts();
      const next = Array.isArray(list) ? (list as Workout[]).map(normalizeWorkout) : [];
      setWorkouts(next);
      if (import.meta.env.DEV) {
        console.debug("[Workouts] loaded", next.length, "items");
      }
    } catch {
      setError("Could not load workouts");
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadWorkouts();
      if (cancelled) return;
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "All") return workouts;
    const selected = normalizeCategory(filter);
    const next = workouts.filter(
      (w) => normalizeCategory(w.category) === selected
    );
    if (import.meta.env.DEV) {
      console.debug("[Workouts] filter", filter, "=>", next.length, "items");
    }
    return next;
  }, [workouts, filter]);

  const openAdd = () => { setEditing(null); setForm(emptyWorkout); setModalOpen(true); };
  const openEdit = (w: Workout) => { setEditing(w); setForm({ name: w.name, category: w.category, date: w.date, duration: w.duration, calories: w.calories, mood: w.mood, notes: w.notes, exercises: [...w.exercises] }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name is required"); return; }
    try {
      const saved = await saveWorkout({ ...form, id: editing?.id });
      const id = (saved as { id?: string })?.id;
      if (!id) throw new Error("Invalid response");
      if (editing) {
        setWorkouts((prev) =>
          prev.map((w) => (w.id === editing.id ? normalizeWorkout({ ...w, ...form, id }) : w))
        );
        toast.success("Workout updated");
      } else {
        setWorkouts((prev) => [normalizeWorkout({ id, ...form }), ...prev]);
        toast.success("Workout logged");
      }
      setModalOpen(false);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not save workout");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkoutApi(id);
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
      toast("Workout deleted");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not delete");
    }
  };

  const addExercise = () => setForm((f) => ({ ...f, exercises: [...f.exercises, { name: "", sets: 3, reps: 10, weight: 0 }] }));
  const removeExercise = (i: number) => setForm((f) => ({ ...f, exercises: f.exercises.filter((_, idx) => idx !== i) }));
  const updateExercise = (i: number, field: keyof Exercise, value: string | number) => setForm((f) => ({ ...f, exercises: f.exercises.map((ex, idx) => (idx === i ? { ...ex, [field]: value } : ex)) }));

  return (
    <PageTransition>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-bold">
            YOUR <span className="gradient-text">WORKOUTS</span>
          </motion.h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 space-y-6 pb-20">
        <FadeInUp delay={0.1}>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <motion.button key={c} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFilter(c)} className={`px-5 py-2.5 rounded-full text-sm font-semibold uppercase tracking-wider transition-all ${filter === c ? "gradient-btn" : "bg-muted/30 text-muted-foreground border border-border/30"}`}>{c}</motion.button>
            ))}
          </div>
        </FadeInUp>

        {loading ? (
          <FadeInUp delay={0.2}>
            <div className="glass-card p-16 text-center">
              <p className="text-muted-foreground text-lg">Loading workouts...</p>
            </div>
          </FadeInUp>
        ) : error ? (
          <FadeInUp delay={0.2}>
            <div className="glass-card p-16 text-center space-y-4">
              <p className="text-destructive text-lg">{error}</p>
              <Button onClick={loadWorkouts} variant="outline" className="rounded-xl">
                Retry
              </Button>
            </div>
          </FadeInUp>
        ) : filtered.length === 0 ? (
          <FadeInUp delay={0.2}>
            <div className="glass-card p-16 text-center">
              <p className="text-muted-foreground text-lg">No workouts found. Start your first workout.</p>
            </div>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((w) => (
              <HoverCard key={w.id}>
                <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="glass-card-hover p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{w.name}</h3>
                      <p className="text-sm text-muted-foreground">{w.date}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(w)} className="p-2 rounded-lg hover:bg-muted/30 transition-colors"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(w.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`px-3 py-1 rounded-full font-medium ${catColor[w.category] || "bg-muted/20 text-muted-foreground"}`}>{w.category}</span>
                    <span className="text-muted-foreground">{w.duration} min</span>
                    <span className="text-muted-foreground">{w.calories} kcal</span>
                    <span>{moodEmoji[w.mood]} {w.mood}</span>
                  </div>
                </motion.div>
              </HoverCard>
            ))}
          </StaggerContainer>
        )}

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
          onClick={openAdd}
          className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-2xl flex items-center justify-center glow-primary z-50"
        >
          <Plus className="h-7 w-7" />
        </motion.button>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border/30 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">{editing ? "Edit Workout" : "Log Workout"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Workout Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Push Day" className="bg-muted/30 border-border/30 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v: any) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="bg-muted/30 border-border/30 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.slice(1).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-muted/30 border-border/30 rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: +e.target.value })} className="bg-muted/30 border-border/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Calories</Label>
                  <Input type="number" value={form.calories || ""} onChange={(e) => setForm({ ...form, calories: +e.target.value })} className="bg-muted/30 border-border/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Mood</Label>
                  <Select value={form.mood} onValueChange={(v: any) => setForm({ ...form, mood: v })}>
                    <SelectTrigger className="bg-muted/30 border-border/30 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>{moods.map((m) => <SelectItem key={m} value={m}>{moodEmoji[m]} {m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="How did it go?" className="bg-muted/30 border-border/30 rounded-xl" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Exercises</Label>
                  <Button variant="ghost" size="sm" onClick={addExercise}><Plus className="h-4 w-4 mr-1" /> Add</Button>
                </div>
                {form.exercises.map((ex, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-end">
                    <Input placeholder="Exercise" value={ex.name} onChange={(e) => updateExercise(i, "name", e.target.value)} className="bg-muted/30 border-border/30 rounded-xl text-sm" />
                    <Input type="number" placeholder="Sets" value={ex.sets || ""} onChange={(e) => updateExercise(i, "sets", +e.target.value)} className="bg-muted/30 border-border/30 rounded-xl text-sm w-16" />
                    <Input type="number" placeholder="Reps" value={ex.reps || ""} onChange={(e) => updateExercise(i, "reps", +e.target.value)} className="bg-muted/30 border-border/30 rounded-xl text-sm w-16" />
                    <Input type="number" placeholder="kg" value={ex.weight || ""} onChange={(e) => updateExercise(i, "weight", +e.target.value)} className="bg-muted/30 border-border/30 rounded-xl text-sm w-16" />
                    <button onClick={() => removeExercise(i)} className="p-2 hover:bg-destructive/10 rounded-lg"><X className="h-4 w-4 text-destructive" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} className="flex-1 gradient-btn rounded-xl">Save</Button>
                <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
