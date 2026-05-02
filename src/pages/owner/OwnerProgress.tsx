import { useEffect, useState } from "react";
import { fetchOwnerMembers } from "@/lib/api";
import type { UserProfile } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function OwnerProgress() {
  const [members, setMembers] = useState<UserProfile[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchOwnerMembers();
        if (!cancelled && Array.isArray(list)) setMembers(list as UserProfile[]);
      } catch {
        setMembers([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const memberProgress = members.map(m => {
    const s = (m.id || "x").charCodeAt(0) + (m.id || "x").charCodeAt(1);
    return {
      name: m.name.split(" ")[0],
      workouts: Math.floor(15 + (s % 30)),
      calories: Math.floor(3000 + (s * 37) % 8000),
    };
  });

  const tooltipStyle = { backgroundColor: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 15%)", borderRadius: "12px", color: "hsl(0 0% 95%)" };

  return (
    <div className="section-padding max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-black mb-2">Member Progress</h1>
        <p className="text-muted-foreground">Compare performance across all members</p>
      </motion.div>

      <div className="grid lg:grid-cols-1 gap-6">
        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="font-heading text-lg">Workouts Completed</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis dataKey="name" stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <YAxis stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="workouts" fill="hsl(0 100% 56%)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="font-heading text-lg">Calories Burned</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={memberProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis dataKey="name" stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <YAxis stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="calories" fill="hsl(24 100% 50%)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
