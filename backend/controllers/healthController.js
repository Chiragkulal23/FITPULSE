import User from "../models/User.js";
import { bmiFromMetrics, waterRecommendedLiters, heartRateZone } from "../utils/calculations.js";

export async function postBmi(req, res) {
  try {
    const weight = Number(req.body.weight);
    const heightCm = Number(req.body.height_cm ?? req.body.heightCm);
    if (!weight || !heightCm) {
      return res.status(400).json({ message: "weight and height_cm required" });
    }
    const { bmi, category } = bmiFromMetrics(weight, heightCm);
    res.json({ bmi, category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function postWater(req, res) {
  try {
    const glasses = Math.max(0, Number(req.body.glasses) || 0);
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.waterGlasses = glasses;
    await user.save();

    const weight = user.weight > 0 ? user.weight : 70;
    const recommendedLiters = waterRecommendedLiters(weight);
    const zone = heartRateZone(user.age);

    res.json({
      glasses,
      recommendedLiters,
      heartRateZone: zone,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
