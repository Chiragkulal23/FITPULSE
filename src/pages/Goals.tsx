import { useState, useEffect } from "react";
import { mockData } from "@/lib/mockData";
import { fetchGoals, saveGoal, deleteGoalApi } from "@/lib/api";
import { Goal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition, FadeInUp, HoverCard, StaggerContainer, motion } from "@/components/MotionWrapper";
export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockData.goals);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", target: 0, unit: "", deadline: "" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchGoals();
        if (!cancelled && Array.isArray(list) && list.length) setGoals(list as Goal[]);
      } catch {
        if (!cancelled) toast.error("Could not load goals");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.target) { toast.error("Name and target required"); return; }
    try {
      const saved = await saveGoal({
        name: form.name,
        target: form.target,
        unit: form.unit,
        deadline: form.deadline,
        current: 0,
      });
      const id = (saved as { id?: string }).id;
      if (!id) throw new Error("Bad response");
      setGoals((prev) => [...prev, { id, name: form.name, current: 0, target: form.target, unit: form.unit, deadline: form.deadline }]);
      toast.success("Goal added");
      setModalOpen(false);
      setForm({ name: "", target: 0, unit: "", deadline: "" });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not add goal");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGoalApi(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast("Goal deleted");
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || "Could not delete goal");
    }
  };

  return (
    <PageTransition>
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-6xl font-bold">
            YOUR <span className="gradient-text">GOALS</span>
          </motion.h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setModalOpen(true)} className="gradient-btn px-6 py-3 rounded-full"><Plus className="h-4 w-4 mr-2" /> Add Goal</Button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 pb-20">
        {goals.length === 0 ? (
          <FadeInUp delay={0.1}>
            <div className="glass-card p-16 text-center">
              <p className="text-muted-foreground text-lg">No goals yet. Set your first fitness goal!</p>
            </div>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goals.map((g) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100));
              const complete = pct >= 100;
              return (
                <HoverCard key={g.id}>
                  <motion.div
                    variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
                    className={`glass-card-hover p-6 ${complete ? "border-secondary/40 glow-secondary" : ""}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {complete && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                            <CheckCircle2 className="h-6 w-6 text-secondary" />
                          </motion.div>
                        )}
                        <h3 className="font-bold text-lg">{g.name}</h3>
                      </div>
                      <button onClick={() => handleDelete(g.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                    <div className="mb-3">
                      <Progress value={pct} className="h-3" />
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{g.current} / {g.target} {g.unit}</span>
                      <span className={`font-bold ${complete ? "text-secondary" : "text-foreground"}`}>{pct}%</span>
                    </div>
                    {g.deadline && <p className="text-xs text-muted-foreground mt-2">Deadline: {g.deadline}</p>}
                  </motion.div>
                </HoverCard>
              );
            })}
          </StaggerContainer>
        )}

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-sm bg-card border-border/30 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading text-xl">Add Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Run 100km" className="bg-muted/30 border-border/30 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target *</Label>
                  <Input type="number" value={form.target || ""} onChange={(e) => setForm({ ...form, target: +e.target.value })} className="bg-muted/30 border-border/30 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="kg, km, etc." className="bg-muted/30 border-border/30 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="bg-muted/30 border-border/30 rounded-xl" />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAdd} className="flex-1 gradient-btn rounded-xl">Add Goal</Button>
                <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1 rounded-xl">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
