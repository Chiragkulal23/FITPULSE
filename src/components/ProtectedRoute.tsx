import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: "user" | "owner" }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === "owner" ? "/owner" : "/"} replace />;
  }
  return <>{children}</>;
}
