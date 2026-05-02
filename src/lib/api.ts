import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const isOwnerRoute = config.url?.includes("/owner/");
  const ownerToken = localStorage.getItem("owner_token");
  const userToken = localStorage.getItem("token");
  
  let token = null;
  if (isOwnerRoute) {
    token = ownerToken;
  } else {
    // For general routes (including gym and auth/profile), use userToken
    token = userToken || ownerToken;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || "");
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthRequest) {
      // Instead of forcing a logout and redirect immediately which can disrupt the UX if there's an API glitch,
      // we'll just reject the promise. The individual components can decide if they want to log the user out.
      console.error("401 Unauthorized received for:", requestUrl);
    }
    return Promise.reject(error);
  }
);

// ── Dashboard ──
export const fetchDashboard = () => api.get("/dashboard").then((r) => r.data);

// ── Workouts ──
export const fetchWorkouts = () => api.get("/workouts").then((r) => r.data);
export const saveWorkout = (data: Record<string, unknown>) => api.post("/workout/save", data).then((r) => r.data);
export const deleteWorkout = (id: string) => api.delete(`/workouts/${id}`).then((r) => r.data);

// ── Sports calculate ──
export const calculateWorkout = (data: { sport: string; durationSec: number; weightKg?: number }) =>
  api.post("/workout/calculate", data).then((r) => r.data);

// ── Health ──
export const calculateBmi = (weight: number, heightCm: number) =>
  api.post("/health/bmi", { weight, height_cm: heightCm }).then((r) => r.data);
export const logWater = (glasses: number) => api.post("/health/water", { glasses }).then((r) => r.data);

// ── Progress ──
export const fetchProgress = () => api.get("/progress").then((r) => r.data);

// ── Goals ──
export const fetchGoals = () => api.get("/goals").then((r) => r.data);
export const saveGoal = (data: Record<string, unknown>) => api.post("/goals", data).then((r) => r.data);
export const deleteGoalApi = (id: string) => api.delete(`/goals/${id}`).then((r) => r.data);

// ── Auth ──
export const loginApi = (email: string, password: string, role?: "user" | "owner") =>
  api.post("/auth/login", { email, password, role }).then((r) => r.data);

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
}

export const registerApi = (payload: RegisterPayload) =>
  api.post("/auth/register", payload).then((r) => r.data);

export const fetchProfileApi = () => api.get("/auth/profile").then((r) => r.data);
export const updateProfileApi = (payload: {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
}) => api.put("/auth/profile", payload).then((r) => r.data);

// ── Owner ──
export const registerOwnerApi = (payload: { ownerName: string; email: string; password: string; gymName: string; gymAddress?: string; gymPhone?: string; gymDescription?: string }) =>
  api.post("/owner/register", payload).then((r) => r.data);

export const loginOwnerApi = (email: string, password: string) =>
  api.post("/owner/login", { email, password }).then((r) => r.data);

export const fetchOwnerProfileApi = () => api.get("/owner/profile").then((r) => r.data);

export const fetchOwnerMembers = () => api.get("/owner/members").then((r) => r.data);
export const fetchOwnerMember = (id: string) => api.get(`/owner/members/${id}`).then((r) => r.data);
export const fetchOwnerAnalytics = () => api.get("/owner/analytics").then((r) => r.data);

// ── Gym Memberships ──
export const requestJoinGym = (gymId: string) => api.post("/gym/request", { gymId }).then((r) => r.data);
export const fetchMembershipRequests = () => api.get("/owner/requests").then((r) => r.data);
export const acceptMembershipRequest = (id: string) => api.post(`/owner/requests/${id}/accept`).then((r) => r.data);
export const rejectMembershipRequest = (id: string) => api.post(`/owner/requests/${id}/reject`).then((r) => r.data);

export default api;
