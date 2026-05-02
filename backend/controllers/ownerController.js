import User from "../models/User.js";
import Workout from "../models/Workout.js";
import Goal from "../models/Goal.js";
import GymOwner from "../models/GymOwner.js";
import MembershipRequest from "../models/MembershipRequest.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function publicMember(u) {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    age: u.age,
    weight: u.weight,
    height: u.height,
    goal: u.goal || "",
    role: u.role,
    joinDate: u.createdAt ? u.createdAt.toISOString().split("T")[0] : "",
  };
}

export async function registerOwner(req, res) {
  try {
    const { ownerName, email, password, gymName, gymAddress, gymPhone, gymDescription } = req.body;
    if (!ownerName || !email || !password || !gymName) {
      return res.status(400).json({ success: false, message: "ownerName, email, password, and gymName are required" });
    }
    const exists = await GymOwner.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const owner = await GymOwner.create({
      ownerName,
      email: email.toLowerCase(),
      password: hashed,
      gymName,
      gymAddress: gymAddress || "",
      gymPhone: gymPhone || "",
      gymDescription: gymDescription || "",
    });
    return res.status(201).json({
      success: true,
      message: "Gym Owner registered successfully",
      owner: {
        ownerName: owner.ownerName,
        gymName: owner.gymName,
        email: owner.email,
        gymId: owner.gymId,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
}

export async function loginOwner(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const owner = await GymOwner.findOne({ email: email.toLowerCase() });
    if (!owner) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    if (!owner.gymId) {
      owner.gymId = "GYM" + Math.random().toString(36).substring(2, 6).toUpperCase();
      await owner.save();
    }
    
    const token = jwt.sign({ ownerId: owner._id.toString(), email: owner.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      success: true,
      token,
      owner: {
        ownerName: owner.ownerName,
        gymName: owner.gymName,
        email: owner.email,
        gymId: owner.gymId,
        role: "owner",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Login failed" });
  }
}

export async function getOwnerProfile(req, res) {
  try {
    const owner = await GymOwner.findById(req.ownerId).select("-password");
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    if (!owner.gymId) {
      owner.gymId = "GYM" + Math.random().toString(36).substring(2, 6).toUpperCase();
      await owner.save();
    }
    return res.json({
      success: true,
      owner: {
        ownerName: owner.ownerName,
        gymName: owner.gymName,
        email: owner.email,
        gymAddress: owner.gymAddress,
        gymPhone: owner.gymPhone,
        gymDescription: owner.gymDescription,
        gymId: owner.gymId,
        role: "owner",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to load profile" });
  }
}

export async function getRequests(req, res) {
  try {
    const owner = await GymOwner.findById(req.ownerId);
    if (!owner) return res.status(404).json({ success: false, message: "Owner not found" });

    const requests = await MembershipRequest.find({ gymId: owner.gymId, status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function acceptRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await MembershipRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const owner = await GymOwner.findById(req.ownerId);
    if (!owner || request.gymId !== owner.gymId) {
       return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    request.status = "approved";
    await request.save();

    if (!owner.members.includes(request.userId)) {
      owner.members.push(request.userId);
      await owner.save();
    }

    await User.findByIdAndUpdate(request.userId, {
      gymId: owner.gymId,
      membershipStatus: "approved"
    });

    res.json({ success: true, message: "Request accepted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function rejectRequest(req, res) {
  try {
    const { id } = req.params;
    const request = await MembershipRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });

    const owner = await GymOwner.findById(req.ownerId);
    if (!owner || request.gymId !== owner.gymId) {
       return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    request.status = "rejected";
    await request.save();

    await User.findByIdAndUpdate(request.userId, {
      gymId: null,
      membershipStatus: "none"
    });

    res.json({ success: true, message: "Request rejected successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMembers(req, res) {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    res.json(users.map(publicMember));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMemberById(req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "user" }).select("-password");
    if (!user) return res.status(404).json({ message: "Member not found" });

    const workouts = await Workout.find({ user: user._id });
    const totalCalories = workouts.reduce((s, w) => s + (w.calories || 0), 0);
    const totalMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);

    const days = new Set(workouts.map((w) => w.date));
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (days.has(key)) streak++;
      else {
        if (i === 0) continue;
        break;
      }
    }

    const calories = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => ({
      day,
      cal: Math.round(150 + ((idx + 1) * totalCalories) % 400),
    }));

    const strength = Array.from({ length: 6 }, (_, i) => ({
      week: `W${i + 1}`,
      bench: 40 + ((workouts.length + i) * 7) % 40,
      squat: 60 + ((totalMinutes + i) * 3) % 50,
    }));

    res.json({
      member: publicMember(user),
      progress: {
        workouts: workouts.length,
        totalCalories,
        streak,
        weightProgress: user.weight ? -Math.min(5, Math.floor(workouts.length / 10)) : 0,
        calories,
        strength,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAnalytics(req, res) {
  try {
    const members = await User.find({ role: "user" }).select("-password").sort({ createdAt: 1 });
    const memberIds = members.map((m) => m._id);
    const allWorkouts = await Workout.find({ user: { $in: memberIds } });
    const goals = await Goal.find({ user: { $in: memberIds } });

    const goalDist = {};
    members.forEach((m) => {
      const g = m.goal || "Other";
      goalDist[g] = (goalDist[g] || 0) + 1;
    });

    const jsDayToLabel = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyByJs = jsDayToLabel.map((day) => ({ day, workouts: 0 }));
    for (const w of allWorkouts) {
      const dt = new Date(w.date + "T12:00:00");
      if (Number.isNaN(dt.getTime())) continue;
      const idx = dt.getDay();
      weeklyByJs[idx].workouts += 1;
    }
    const weeklyWorkouts = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
      const js = day === "Sun" ? 0 : jsDayToLabel.indexOf(day);
      return { day, workouts: weeklyByJs[js]?.workouts ?? 0 };
    });

    const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const growthMap = {};
    for (const m of members) {
      const k = monthKey(m.createdAt);
      growthMap[k] = (growthMap[k] || 0) + 1;
    }
    let cum = 0;
    const memberGrowth = Object.keys(growthMap)
      .sort()
      .map((k) => {
        cum += growthMap[k];
        const [y, mo] = k.split("-");
        const label = new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-US", { month: "short" });
        return { month: label, members: cum };
      });

    res.json({
      totalMembers: members.length,
      totalWorkouts: allWorkouts.length,
      totalGoals: goals.length,
      goalDistribution: Object.entries(goalDist).map(([name, value]) => ({ name, value })),
      members: members.map(publicMember),
      weeklyWorkouts,
      memberGrowth: memberGrowth.length ? memberGrowth : [{ month: "Jan", members: members.length }],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
