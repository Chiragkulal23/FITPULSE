import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type UserProfile } from "@/contexts/AuthContext";
import { fetchOwnerMembers } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function OwnerMembers() {
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(
    () =>
      members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          (m.goal || "").toLowerCase().includes(search.toLowerCase())
      ),
    [members, search]
  );

  return (
    <div className="section-padding max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-3xl font-black mb-2">Members</h1>
        <p className="text-muted-foreground">All registered gym members</p>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/30 border-border/30 rounded-xl h-11"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/owner/members/${m.id}`}>
              <Card className="glass-card border-border/20 glass-card-hover group cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
                      {m.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold truncate">{m.name}</div>
                      <div className="text-xs text-muted-foreground">{m.email}</div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/20 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Age</div>
                      <div className="font-bold text-sm">{m.age || "-"}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Weight</div>
                      <div className="font-bold text-sm">{m.weight ? `${m.weight}kg` : "-"}</div>
                    </div>
                    <div className="bg-muted/20 rounded-lg p-2">
                      <div className="text-xs text-muted-foreground">Goal</div>
                      <div className="font-bold text-sm truncate">{m.goal || "-"}</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">Joined: {m.joinDate}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
