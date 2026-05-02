import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { toast } from "sonner";
import { fetchProfileApi, loginApi, registerApi, type RegisterPayload, updateProfileApi } from "@/lib/api";

export interface UserProfile {
  id?: string;
  name?: string; // Standard user
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  role: "user" | "owner";
  joinDate?: string;
  gymId?: string;
  membershipStatus?: "none" | "pending" | "approved";
  // Owner specific
  ownerName?: string;
  gymName?: string;
  gymAddress?: string;
  gymPhone?: string;
  gymDescription?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: "user" | "owner") => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  registerOwner: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: { name?: string; age?: number; weight?: number; height?: number; goal?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadPersistedAuth(): { token: string | null; user: UserProfile | null } {
  const oToken = localStorage.getItem("owner_token");
  const oProfile = localStorage.getItem("owner_profile");
  
  if (oToken && oProfile) {
    try {
      return { token: oToken, user: JSON.parse(oProfile) as UserProfile };
    } catch {
      localStorage.removeItem("owner_profile");
      localStorage.removeItem("owner_token");
    }
  }

  const t = localStorage.getItem("token");
  const stored = localStorage.getItem("user_profile");

  if (!t) {
    if (stored) localStorage.removeItem("user_profile");
    return { token: null, user: null };
  }
  if (!stored) {
    localStorage.removeItem("token");
    return { token: null, user: null };
  }
  try {
    const parsed = JSON.parse(stored) as UserProfile;
    return { token: t, user: parsed };
  } catch (err) {
    console.warn("Failed to parse stored user profile, clearing invalid data.", err);
    localStorage.removeItem("user_profile");
    localStorage.removeItem("token");
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initialAuth = useMemo(() => loadPersistedAuth(), []);
  const [token, setToken] = useState<string | null>(initialAuth.token);
  const [user, setUser] = useState<UserProfile | null>(initialAuth.user);

  useEffect(() => {
    if (token && user?.role === "owner") {
      localStorage.setItem("owner_token", token);
    } else if (token) {
      localStorage.setItem("token", token);
    } else { 
      localStorage.removeItem("token"); 
      localStorage.removeItem("user_profile"); 
      localStorage.removeItem("owner_token");
      localStorage.removeItem("owner_profile");
    }
  }, [token, user]);

  useEffect(() => {
    if (user?.role === "owner") {
      localStorage.setItem("owner_profile", JSON.stringify(user));
    } else if (user) {
      localStorage.setItem("user_profile", JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string, role: "user" | "owner") => {
    try {
      if (role === "owner") {
        const { loginOwnerApi } = await import("@/lib/api");
        const data = await loginOwnerApi(email, password);
        setToken(data.token);
        setUser(data.owner);
      } else {
        const data = await loginApi(email, password, role);
        setToken(data.token);
        setUser(data.user);
      }
      toast.success("Welcome back!");
    } catch (e: unknown) {
      const ax = e as { response?: { status?: number; data?: { message?: string } } };
      const message = ax.response?.data?.message || "Login failed";
      toast.error(message);
      throw new Error(message);
    }
  };

  const register = async (data: RegisterPayload) => {
    try {
      const res = await registerApi(data);
      toast.success(res.message || "Account created! Please sign in.");
    } catch (e: unknown) {
      const ax = e as { response?: { status?: number; data?: { message?: string } } };
      const message = ax.response?.data?.message || "Registration failed";
      toast.error(message);
      throw new Error(message);
    }
  };

  const registerOwner = async (data: any) => {
    try {
      const { registerOwnerApi } = await import("@/lib/api");
      const res = await registerOwnerApi(data);
      toast.success(res.message || "Gym Owner account created! Please sign in.");
    } catch (e: unknown) {
      const ax = e as { response?: { status?: number; data?: { message?: string } } };
      const message = ax.response?.data?.message || "Registration failed";
      toast.error(message);
      throw new Error(message);
    }
  };

  const refreshProfile = async () => {
    if (user?.role === "owner") {
      const { fetchOwnerProfileApi } = await import("@/lib/api");
      const data = await fetchOwnerProfileApi();
      if (data?.owner) setUser(data.owner);
    } else {
      const data = await fetchProfileApi();
      if (data?.user) setUser(data.user);
    }
  };

  const updateProfile = async (data: { name?: string; age?: number; weight?: number; height?: number; goal?: string }) => {
    const res = await updateProfileApi(data);
    if (res?.user) {
      setUser(res.user);
      toast.success(res.message || "Profile updated");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    toast("Logged out");
  };

  useEffect(() => {
    if (!token) return;
    refreshProfile().catch(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user_profile");
      setToken(null);
      setUser(null);
    });
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!(token && user),
        login,
        register,
        registerOwner,
        refreshProfile,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
