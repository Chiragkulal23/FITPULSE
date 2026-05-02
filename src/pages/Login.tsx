import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Dumbbell, Activity, TrendingUp, Target, Users, ChevronRight, Flame, Zap, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ModalView = "choose" | "user-login" | "owner-login" | "owner-register" | null;

export default function LoginPage() {
  const { login, registerOwner, isAuthenticated, user } = useAuth();
  const [modalView, setModalView] = useState<ModalView>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [gymName, setGymName] = useState("");
  const [gymAddress, setGymAddress] = useState("");
  const [gymPhone, setGymPhone] = useState("");
  const [gymDescription, setGymDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && user) {
    return <Navigate to={user.role === "owner" ? "/owner" : "/"} replace />;
  }

  const resetForm = () => { setEmail(""); setPassword(""); setOwnerName(""); setGymName(""); setGymAddress(""); setGymPhone(""); setGymDescription(""); setError(""); setLoading(false); };
  const openModal = (view: ModalView) => { resetForm(); setModalView(view); };

  const handleLogin = async (role: "user" | "owner") => {
    setError("");
    setLoading(true);
    try {
      await login(email, password, role);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerOwner({ ownerName, email, password, gymName, gymAddress, gymPhone, gymDescription });
      openModal("owner-login");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Activity, title: "Track Workouts", desc: "Log every rep, set, and session" },
    { icon: TrendingUp, title: "Monitor Progress", desc: "Visual charts and analytics" },
    { icon: Target, title: "Set Goals", desc: "Achieve your fitness milestones" },
    { icon: Flame, title: "Calorie Tracking", desc: "Monitor your burn rate" },
    { icon: Zap, title: "HIIT & Cardio", desc: "All workout types supported" },
    { icon: BarChart3, title: "Gym Analytics", desc: "Owner dashboard & insights" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      {/* Top Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">FITPULSE</span>
        </div>
        <Button
          onClick={() => openModal("choose")}
          className="gradient-btn px-6 py-2 text-sm font-semibold rounded-xl"
        >
          Login
        </Button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-12 md:pt-24 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Flame className="h-4 w-4" /> #1 Fitness Tracking Platform
            </motion.div>

            <h1 className="font-heading text-4xl md:text-6xl font-black leading-tight mb-6">
              PUSH YOUR <br />
              <span className="gradient-text">LIMITS</span> BEYOND
            </h1>

            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg leading-relaxed">
              The ultimate fitness tracker built for hardcore athletes and gym owners.
              Track workouts, crush goals, and monitor your gym — all in one powerful app.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Button onClick={() => openModal("choose")} className="gradient-btn px-8 py-3 text-base font-bold rounded-xl h-auto">
                Get Started <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
              <Button variant="outline" className="px-8 py-3 text-base rounded-xl h-auto border-border/50 hover:bg-muted/20">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 md:gap-12">
              {[
                { val: "10K+", label: "Active Users" },
                { val: "500+", label: "Gyms" },
                { val: "1M+", label: "Workouts Logged" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="text-2xl md:text-3xl font-black gradient-text">{s.val}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="glass-card p-5 rounded-2xl glass-card-hover group"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3 group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={modalView !== null} onOpenChange={(open) => !open && setModalView(null)}>
        <DialogContent className="sm:max-w-md glass-card border-border/30 bg-card/95 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* Choose Role */}
            {modalView === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-center">Welcome to FitPulse</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-center text-sm mb-6">Choose how you want to sign in</p>
                <div className="space-y-3">
                  <button
                    onClick={() => openModal("user-login")}
                    className="w-full glass-card glass-card-hover p-5 rounded-2xl flex items-center gap-4 text-left transition-all group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <Dumbbell className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-base">User Login</div>
                      <div className="text-sm text-muted-foreground">Track workouts & crush goals</div>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <button
                    onClick={() => openModal("owner-login")}
                    className="w-full glass-card glass-card-hover p-5 rounded-2xl flex items-center gap-4 text-left transition-all group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-heading font-bold text-base">Gym Owner Login</div>
                      <div className="text-sm text-muted-foreground">Manage members & analytics</div>
                    </div>
                    <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* User Login */}
            {modalView === "user-login" && (
              <motion.div
                key="user-login"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-center">User Login</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin("user"); }} className="space-y-4 mt-4">
                  {error && <p className="text-sm text-destructive text-center">{error}</p>}
                  <div className="space-y-2">
                    <Label htmlFor="u-email">Email</Label>
                    <Input id="u-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="u-pass">Password</Label>
                    <Input id="u-pass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-12" />
                  </div>
                  <Button type="submit" className="w-full gradient-btn rounded-xl h-12 text-base" disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>
                  <div className="text-center">
                    <Link to="/register" onClick={() => setModalView(null)} className="text-primary hover:underline text-sm font-medium">
                      Create Account
                    </Link>
                  </div>
                  <button type="button" onClick={() => openModal("choose")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← Back
                  </button>
                </form>
              </motion.div>
            )}

            {/* Owner Login */}
            {modalView === "owner-login" && (
              <motion.div
                key="owner-login"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-center">Gym Owner Login</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleLogin("owner"); }} className="space-y-4 mt-4">
                  {error && <p className="text-sm text-destructive text-center">{error}</p>}
                  <div className="space-y-2">
                    <Label htmlFor="o-email">Email</Label>
                    <Input id="o-email" type="email" placeholder="owner@gym.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="o-pass">Password</Label>
                    <Input id="o-pass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-12" />
                  </div>
                  <Button type="submit" className="w-full gradient-btn rounded-xl h-12 text-base" disabled={loading}>
                    {loading ? "Signing in..." : "Login as Owner"}
                  </Button>
                  <div className="text-center">
                    <button type="button" onClick={() => openModal("owner-register")} className="text-primary hover:underline text-sm font-medium">
                      Create Gym Owner Account
                    </button>
                  </div>
                  <button type="button" onClick={() => openModal("choose")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← Back
                  </button>
                </form>
              </motion.div>
            )}

            {/* Owner Register */}
            {modalView === "owner-register" && (
              <motion.div
                key="owner-register"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="font-heading text-2xl text-center">Register as Gym Owner</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOwnerRegister} className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto px-1">
                  {error && <p className="text-sm text-destructive text-center">{error}</p>}
                  <div className="space-y-2">
                    <Label htmlFor="or-name">Owner Name</Label>
                    <Input id="or-name" placeholder="John Doe" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="or-email">Email</Label>
                    <Input id="or-email" type="email" placeholder="owner@gym.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="or-pass">Password</Label>
                    <Input id="or-pass" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="or-gymName">Gym Name</Label>
                    <Input id="or-gymName" placeholder="FitZone" value={gymName} onChange={(e) => setGymName(e.target.value)} required className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="or-gymAddress">Gym Address (Optional)</Label>
                    <Input id="or-gymAddress" placeholder="123 Fitness St" value={gymAddress} onChange={(e) => setGymAddress(e.target.value)} className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="or-gymPhone">Gym Phone (Optional)</Label>
                    <Input id="or-gymPhone" placeholder="+1 234 567 890" value={gymPhone} onChange={(e) => setGymPhone(e.target.value)} className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="or-gymDesc">Gym Description (Optional)</Label>
                    <Input id="or-gymDesc" placeholder="Best gym in town" value={gymDescription} onChange={(e) => setGymDescription(e.target.value)} className="bg-muted/30 border-border/30 rounded-xl h-10" />
                  </div>
                  <Button type="submit" className="w-full gradient-btn rounded-xl h-12 text-base" disabled={loading}>
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                  <button type="button" onClick={() => openModal("owner-login")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
                    ← Back to Login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
