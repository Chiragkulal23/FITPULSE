import Goal from "../models/Goal.js";

function mapGoal(g) {
  return {
    id: g._id.toString(),
    name: g.name,
    current: g.progress ?? 0,
    target: g.target,
    unit: g.unit || "",
    deadline: g.deadline || "",
    type: g.type,
  };
}

export async function getGoals(req, res) {
  try {
    const list = await Goal.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(list.map(mapGoal));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createGoal(req, res) {
  try {
    const { name, target, unit, deadline, current, type } = req.body;
    if (!name || target == null) {
      return res.status(400).json({ message: "name and target required" });
    }
    const created = await Goal.create({
      user: req.userId,
      name,
      type: type || name,
      target: Number(target),
      progress: Number(current) || 0,
      unit: unit || "",
      deadline: deadline || "",
    });
    res.status(201).json(mapGoal(created));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteGoal(req, res) {
  try {
    const { id } = req.params;
    const result = await Goal.deleteOne({ _id: id, user: req.userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
