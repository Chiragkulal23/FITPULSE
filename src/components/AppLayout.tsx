import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, Dumbbell, Bike, HeartPulse, Lightbulb, ListChecks, TrendingUp, Target, LogOut, Menu, X, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Gym", url: "/gym", icon: Dumbbell },
  { title: "Sports", url: "/sports", icon: Bike },
  { title: "Health", url: "/health", icon: HeartPulse },
  { title: "Tips", url: "/tips", icon: Lightbulb },
  { title: "Workouts", url: "/workouts", icon: ListChecks },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Goals", url: "/goals", icon: Target },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/30 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">FITPULSE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.url;
              return (
                <Link
                  key={item.url}
                  to={item.url}
                  className={`px-3 py-2 rounded-lg text-sm font-medium uppercase tracking-wider transition-all duration-200 ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/profile" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors">
              <UserCircle className="h-5 w-5" />
            </Link>
            <button
              onClick={logout}
              className="gradient-btn px-5 py-2 text-sm flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted/30 transition-colors"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-4">
              {navItems.map((item, i) => {
                const active = location.pathname === item.url;
                return (
                  <motion.div
                    key={item.url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={item.url}
                      className={`flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-medium uppercase tracking-wider transition-all ${
                        active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={logout}
                className="gradient-btn px-8 py-3 mt-4 text-sm flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        {children}
      </main>
    </div>
  );
}
