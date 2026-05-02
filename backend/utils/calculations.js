/** MET values (approx) by sport id */
const MET_BY_SPORT = {
  running: 9,
  walking: 3.5,
  cycling: 6,
  cricket: 4.8,
  football: 7,
  basketball: 6.5,
  badminton: 5.5,
  swimming: 8,
  hiking: 6,
  yoga: 2.5,
  hiit: 8,
};

const DISTANCE_SPORTS = new Set([
  "running",
  "walking",
  "cycling",
  "football",
  "swimming",
  "hiking",
]);

/** km/h for distance where applicable */
const SPEED_KMH = {
  walking: 5,
  running: 9,
  cycling: 15,
  hiking: 4,
  swimming: 3,
  football: 7,
  running_default: 9,
};

export function caloriesFromMet(met, weightKg, durationSec) {
  const hours = durationSec / 3600;
  const w = weightKg > 0 ? weightKg : 70;
  return Math.round(met * w * hours);
}

export function getMetForSport(sportId) {
  const key = (sportId || "").toLowerCase();
  return MET_BY_SPORT[key] ?? 5;
}

export function stepsFromSport(sportId, durationSec) {
  const min = durationSec / 60;
  const s = (sportId || "").toLowerCase();
  if (s === "walking") return Math.round(min * 100);
  if (s === "running") return Math.round(min * 160);
  return Math.round(min * 90);
}

export function distanceKmFromSport(sportId, durationSec) {
  const s = (sportId || "").toLowerCase();
  if (!DISTANCE_SPORTS.has(s)) return 0;
  const hours = durationSec / 3600;
  const kmh = SPEED_KMH[s] ?? 6;
  return Math.round(kmh * hours * 100) / 100;
}

export function calculateWorkoutStats({ sport, durationSec, weightKg }) {
  const met = getMetForSport(sport);
  const w = weightKg > 0 ? weightKg : 70;
  const calories = caloriesFromMet(met, w, durationSec);
  const steps = stepsFromSport(sport, durationSec);
  const distance = distanceKmFromSport(sport, durationSec);
  return { calories, steps, distance };
}

export function bmiFromMetrics(weightKg, heightCm) {
  const hM = heightCm / 100;
  const bmi = weightKg / (hM * hM);
  const rounded = Math.round(bmi * 10) / 10;
  let category = "Obese";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 25) category = "Normal";
  else if (bmi < 30) category = "Overweight";
  return { bmi: rounded, category };
}

/** Recommended daily water (liters): weight × 0.035 */
export function waterRecommendedLiters(weightKg) {
  if (!weightKg || weightKg <= 0) return 2;
  return Math.round(weightKg * 0.035 * 100) / 100;
}

/** Target heart rate zone ~ 60–80% of (220 - age) */
export function heartRateZone(age) {
  const a = age > 0 ? age : 30;
  const maxHr = 220 - a;
  return {
    maxHr,
    low: Math.round(maxHr * 0.6),
    high: Math.round(maxHr * 0.8),
  };
}
