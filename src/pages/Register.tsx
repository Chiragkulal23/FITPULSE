import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && user) return <Navigate to={user.role === "owner" ? "/owner" : "/"} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      await register({
        name, email, password,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
        goal: goal || undefined,
      });
      navigate("/login", { replace: true });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "bg-muted/30 border-border/30 rounded-xl h-11";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg glass-card p-8 md:p-10 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex items-center gap-3 mb-8 justify-center"
        >
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Dumbbell className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">FITPULSE</h1>
        </motion.div>
        <h2 className="font-heading text-2xl font-bold text-center mb-6">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive text-center">{error}</motion.p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" placeholder="75" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fitness Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Build Muscle">Build Muscle</SelectItem>
                <SelectItem value="Lose Weight">Lose Weight</SelectItem>
                <SelectItem value="Stay Fit">Stay Fit</SelectItem>
                <SelectItem value="Strength Training">Strength Training</SelectItem>
                <SelectItem value="Marathon Training">Marathon Training</SelectItem>
                <SelectItem value="Flexibility">Flexibility</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full gradient-btn rounded-xl h-12 text-base" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </motion.div>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
