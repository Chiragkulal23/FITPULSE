import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Dumbbell, TrendingUp, Target, LogOut, Flame, Bike, HeartPulse, Lightbulb, ListChecks } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Gym Edition", url: "/gym", icon: Dumbbell },
  { title: "Sports Edition", url: "/sports", icon: Bike },
  { title: "Health Edition", url: "/health", icon: HeartPulse },
  { title: "Fitness Tips", url: "/tips", icon: Lightbulb },
  { title: "Workouts", url: "/workouts", icon: ListChecks },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Goals", url: "/goals", icon: Target },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent className="pt-6">
        <div className={`px-4 mb-6 ${collapsed ? "text-center" : ""}`}>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-heading text-xl font-bold text-primary"
          >
            {collapsed ? "F" : "FitPulse"}
          </motion.h1>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item, i) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary glow-primary"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span className="font-medium text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-3">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/10 border border-secondary/20"
          >
            <Flame className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">5 day streak 🔥</span>
          </motion.div>
        )}
        <motion.button
          whileHover={{ x: 3 }}
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </motion.button>
      </SidebarFooter>
    </Sidebar>
  );
}
