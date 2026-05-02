import "./loadEnv.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import gymRoutes from "./routes/gymRoutes.js";
import User from "./models/User.js";
import GymOwner from "./models/GymOwner.js";
import bcrypt from "bcryptjs";

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in environment");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175", 
      "http://localhost:8080", 
      "http://127.0.0.1:5173", 
      "http://127.0.0.1:5174", 
      "http://127.0.0.1:5175", 
      "http://127.0.0.1:8080",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", workoutRoutes);
app.use("/api", healthRoutes);
app.use("/api", goalRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", progressRoutes);
app.use("/api", ownerRoutes);
app.use("/api", gymRoutes);

app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

async function seedOwner() {
  const email = process.env.SEED_OWNER_EMAIL;
  const password = process.env.SEED_OWNER_PASSWORD;
  const name = process.env.SEED_OWNER_NAME || "Gym Owner";
  if (!email || !password) return;
  const exists = await GymOwner.findOne({ email: email.toLowerCase() });
  if (exists) return;
  const hashed = await bcrypt.hash(password, 10);
  await GymOwner.create({
    ownerName: name,
    email: email.toLowerCase(),
    password: hashed,
    gymName: "Default Gym",
    gymAddress: "",
    gymPhone: "",
    gymDescription: "Seeded gym owner",
  });
  console.log("Seeded gym owner account:", email);
}

await connectDB();
await seedOwner();

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
