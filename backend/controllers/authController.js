import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function toPublicUser(doc) {
  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    age: doc.age,
    weight: doc.weight,
    height: doc.height,
    goal: doc.goal || "",
    role: doc.role,
    joinDate: doc.createdAt ? doc.createdAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    gymId: doc.gymId,
    membershipStatus: doc.membershipStatus,
  };
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Failed to load profile" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, age, weight, height, goal } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (typeof name === "string" && name.trim()) user.name = name.trim();
    if (age !== undefined) user.age = Number(age) || undefined;
    if (weight !== undefined) user.weight = Number(weight) || undefined;
    if (height !== undefined) user.height = Number(height) || undefined;
    if (goal !== undefined) user.goal = String(goal || "");

    await user.save();
    return res.json({ success: true, user: toPublicUser(user), message: "Profile updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Failed to update profile" });
  }
}

export async function register(req, res) {
  try {
    const { name, email, password, age, weight, height, goal } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: "user",
      age: age != null ? Number(age) : undefined,
      weight: weight != null ? Number(weight) : undefined,
      height: height != null ? Number(height) : undefined,
      goal: goal || "",
    });
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Please use ${user.role === "owner" ? "Gym Owner" : "User"} login`,
      });
    }
    const token = jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      success: true,
      token,
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Login failed" });
  }
}
