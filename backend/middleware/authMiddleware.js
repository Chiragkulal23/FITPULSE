import jwt from "jsonwebtoken";
import User from "../models/User.js";
import GymOwner from "../models/GymOwner.js";

export function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized" });
  }
}

export async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Not authorized" });
  }
}

export function requireOwner(req, res, next) {
  if (req.user?.role !== "owner") {
    return res.status(403).json({ message: "Owner access required" });
  }
  next();
}

export async function protectOwner(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }
  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.ownerId) {
      return res.status(401).json({ message: "Not authorized as owner" });
    }
    const owner = await GymOwner.findById(decoded.ownerId).select("-password");
    if (!owner) return res.status(401).json({ message: "Owner not found" });
    req.ownerId = decoded.ownerId;
    req.owner = owner;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
}
