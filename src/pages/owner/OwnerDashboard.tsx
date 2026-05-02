import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type UserProfile, useAuth } from "@/contexts/AuthContext";
import { fetchOwnerAnalytics, fetchMembershipRequests, acceptMembershipRequest, rejectMembershipRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, Dumbbell, TrendingUp, ChevronRight, CheckCircle2, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const defaultWeekly = [
  { day: "Mon", workouts: 24 }, { day: "Tue", workouts: 18 },
  { day: "Wed", workouts: 32 }, { day: "Thu", workouts: 28 },
  { day: "Fri", workouts: 35 }, { day: "Sat", workouts: 40 },
  { day: "Sun", workouts: 15 },
];

const defaultGrowth = [
  { month: "Jan", members: 120 }, { month: "Feb", members: 135 },
  { month: "Mar", members: 148 }, { month: "Apr", members: 162 },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [weeklyData, setWeeklyData] = useState(defaultWeekly);
  const [memberGrowth, setMemberGrowth] = useState(defaultGrowth);
  const [requests, setRequests] = useState<any[]>([]);
  const [copiedGymId, setCopiedGymId] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, reqs] = await Promise.all([
          fetchOwnerAnalytics().catch(() => null),
          fetchMembershipRequests().catch(() => null),
        ]);
        if (cancelled) return;
        if (d) {
          if (Array.isArray(d.members) && d.members.length) setMembers(d.members as UserProfile[]);
          if (typeof d.totalWorkouts === "number") setTotalWorkouts(d.totalWorkouts);
          if (Array.isArray(d.weeklyWorkouts) && d.weeklyWorkouts.length) setWeeklyData(d.weeklyWorkouts);
          if (Array.isArray(d.memberGrowth) && d.memberGrowth.length) setMemberGrowth(d.memberGrowth);
        }
        if (reqs && Array.isArray(reqs.requests)) {
          setRequests(reqs.requests);
        }
      } catch {
        /* demo */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleCopyGymId = () => {
    if (user?.gymId) {
      navigator.clipboard.writeText(user.gymId);
      setCopiedGymId(true);
      toast.success("Gym ID copied to clipboard!");
      setTimeout(() => setCopiedGymId(false), 2000);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await acceptMembershipRequest(id);
      toast.success("Request accepted!");
      setRequests(r => r.filter(req => req._id !== id));
      // Reload analytics implicitly if possible, but fine as is
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMembershipRequest(id);
      toast.success("Request rejected!");
      setRequests(r => r.filter(req => req._id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject");
    }
  };

  const stats = useMemo(
    () => [
      { label: "Total Members", value: members.length, icon: Users, color: "from-primary to-secondary" },
      { label: "Active Today", value: Math.max(1, Math.ceil(members.length * 0.6)), icon: Activity, color: "from-secondary to-primary" },
      { label: "Total Workouts", value: totalWorkouts || members.length * 24, icon: Dumbbell, color: "from-primary to-secondary" },
      {
        label: "Avg Progress",
        value: members.length ? `${Math.min(99, Math.round((totalWorkouts / members.length) * 3))}%` : "78%",
        icon: TrendingUp,
        color: "from-secondary to-primary",
      },
    ],
    [members, totalWorkouts]
  );

  const tooltipStyle = { backgroundColor: "hsl(0 0% 6%)", border: "1px solid hsl(0 0% 15%)", borderRadius: "12px", color: "hsl(0 0% 95%)" };

  return (
    <div className="section-padding max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl font-black mb-2">{user?.gymName || "Gym Overview"}</h1>
          <p className="text-muted-foreground">Welcome back, {user?.ownerName || user?.name || "Owner"}. Here&apos;s your gym at a glance.</p>
        </div>
        <div className="flex flex-col gap-2">
          {user?.gymId && (
            <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Gym ID:</span>
              <span className="font-mono font-bold text-primary">{user.gymId}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 hover:bg-primary/20" onClick={handleCopyGymId}>
                {copiedGymId ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-primary" />}
              </Button>
            </div>
          )}
          {(user as any)?.gymAddress && (
             <div className="px-4 py-2 rounded-xl bg-muted/30 border border-border/20 text-sm flex items-center gap-2">
               <CheckCircle2 className="h-4 w-4 text-primary" />
               {(user as any).gymAddress}
             </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/20 glass-card-hover">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="font-heading text-lg">Weekly Workouts</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis dataKey="day" stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <YAxis stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="workouts" fill="hsl(0 100% 56%)" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/20">
          <CardHeader><CardTitle className="font-heading text-lg">Member Growth</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 12%)" />
                <XAxis dataKey="month" stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <YAxis stroke="hsl(0 0% 35%)" tick={{ fill: "hsl(0 0% 50%)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="members" stroke="hsl(24 100% 50%)" strokeWidth={3} dot={{ fill: "hsl(24 100% 50%)", r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading text-lg">Recent Members</CardTitle>
          <Link to="/owner/members" className="text-sm text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.length === 0 ? (
               <p className="text-sm text-muted-foreground p-2">No active members found.</p>
            ) : (
               members.slice(0, 4).map((m, i) => (
                 <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                   <Link to={`/owner/members/${m.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/20 transition-colors group">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold text-primary-foreground">
                         {m.name?.split(" ").map((n) => n[0]).join("") || "?"}
                       </div>
                       <div>
                         <div className="font-medium text-sm">{m.name}</div>
                         <div className="text-xs text-muted-foreground">{m.goal || "No goal specified"}</div>
                       </div>
                     </div>
                     <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                   </Link>
                 </motion.div>
               ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Membership Requests */}
      <Card className="glass-card border-border/20">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Membership Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              No pending membership requests. Share your Gym ID: <strong className="text-foreground">{user?.gymId}</strong>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req, i) => (
                <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/20 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {req.userId?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <div className="font-medium">{req.userId?.name || "Unknown User"}</div>
                      <div className="text-xs text-muted-foreground">{req.userId?.email || "No email"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="rounded-lg h-9 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" onClick={() => handleReject(req._id)}>
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button size="sm" className="gradient-btn rounded-lg h-9" onClick={() => handleAccept(req._id)}>
                      <Check className="h-4 w-4 mr-1" /> Accept
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
