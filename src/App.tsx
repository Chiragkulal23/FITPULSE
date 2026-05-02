import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import OwnerLayout from "@/components/OwnerLayout";
const Index = lazy(() => import("./pages/Index"));
const LoginPage = lazy(() => import("./pages/Login"));
const RegisterPage = lazy(() => import("./pages/Register"));
const WorkoutsPage = lazy(() => import("./pages/Workouts"));
const ProgressPage = lazy(() => import("./pages/Progress"));
const GoalsPage = lazy(() => import("./pages/Goals"));
const GymPage = lazy(() => import("./pages/Gym"));
const SportsPage = lazy(() => import("./pages/Sports"));
const HealthPage = lazy(() => import("./pages/Health"));
const TipsPage = lazy(() => import("./pages/Tips"));
const ProfilePage = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OwnerDashboard = lazy(() => import("./pages/owner/OwnerDashboard"));
const OwnerMembers = lazy(() => import("./pages/owner/OwnerMembers"));
const MemberDetail = lazy(() => import("./pages/owner/MemberDetail"));
const OwnerProgress = lazy(() => import("./pages/owner/OwnerProgress"));
const OwnerAnalytics = lazy(() => import("./pages/owner/OwnerAnalytics"));

const queryClient = new QueryClient();

const UserPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole="user">
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

const OwnerPage = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requiredRole="owner">
    <OwnerLayout>{children}</OwnerLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Sonner />
        <AuthProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* User routes */}
              <Route path="/" element={<UserPage><Index /></UserPage>} />
              <Route path="/gym" element={<UserPage><GymPage /></UserPage>} />
              <Route path="/sports" element={<UserPage><SportsPage /></UserPage>} />
              <Route path="/health" element={<UserPage><HealthPage /></UserPage>} />
              <Route path="/tips" element={<UserPage><TipsPage /></UserPage>} />
              <Route path="/workouts" element={<UserPage><WorkoutsPage /></UserPage>} />
              <Route path="/progress" element={<UserPage><ProgressPage /></UserPage>} />
              <Route path="/goals" element={<UserPage><GoalsPage /></UserPage>} />
              <Route path="/profile" element={<UserPage><ProfilePage /></UserPage>} />
              {/* Owner routes */}
              <Route path="/owner" element={<OwnerPage><OwnerDashboard /></OwnerPage>} />
              <Route path="/owner/members" element={<OwnerPage><OwnerMembers /></OwnerPage>} />
              <Route path="/owner/members/:id" element={<OwnerPage><MemberDetail /></OwnerPage>} />
              <Route path="/owner/progress" element={<OwnerPage><OwnerProgress /></OwnerPage>} />
              <Route path="/owner/analytics" element={<OwnerPage><OwnerAnalytics /></OwnerPage>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
