// Small Hostel Mess Sustainability Model
// Calibrated for 600–1200 meals/day and 10–60kg daily waste

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function gaussianNoise(mean = 0, std = 1) {
  let u = 1 - Math.random();
  let v = 1 - Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Time-of-day multiplier (real mess behavior)
function timeBias(hour) {
  if (hour >= 7 && hour <= 9) return 1.1;   // breakfast
  if (hour >= 12 && hour <= 14) return 1.4; // lunch peak
  if (hour >= 19 && hour <= 21) return 1.5; // dinner peak
  return 0.6;
}

// Congestion penalty factor
function congestionPenalty(level) {
  if (level === "HIGH") return 0.18;
  if (level === "LOW") return -0.05;
  return 0;
}

// Rolling baseline so trends feel continuous
let rollingDailyWaste = 25 + Math.random() * 10;

export function simulateSustainability({
  queueSize = 120,
  congestion = "MEDIUM",
  sensorConfidence = 0.92
} = {}) {
  const now = new Date();
  const hour = now.getHours();

  // Plates per minute (physical constraint)
  const baseRate = 8 + Math.random() * 6; // 8–14 plates/min
  const flow = clamp(
    baseRate * timeBias(hour),
    5,
    16
  );

  // Completion model
  const baseCompletion = 0.82; // 80–85% realistic
  const noise = gaussianNoise(0, 0.03);
  const completion = clamp(
    baseCompletion - congestionPenalty(congestion) + noise,
    0.65,
    0.92
  );

  const wasteRatio = clamp(1 - completion, 0.05, 0.35);

  // Leftover per plate (kg)
  const wasteKgPerPlate = clamp(
    0.02 + gaussianNoise(0, 0.008),
    0.01,
    0.05
  );

  const wasteKgPerMin = flow * wasteRatio * wasteKgPerPlate;

  // Smooth daily accumulation (trend-based, not jumpy)
  rollingDailyWaste = clamp(
    rollingDailyWaste + wasteKgPerMin * 2 + gaussianNoise(0, 0.5),
    10,
    60
  );

  // Environmental estimates (scaled down for realism)
  const carbonFactor = 1.8; // kg CO₂ per kg waste (conservative)
  const waterFactor = 10;  // liters per kg waste

  return {
    timestamp: Date.now(),
    hour,
    queueSize,
    congestion,
    sensorConfidence,

    plateRate: Math.round(flow),
    completionRatio: Number((completion * 100).toFixed(1)),
    wasteRatio: Number((wasteRatio * 100).toFixed(1)),

    wasteKgPerMin: Number(wasteKgPerMin.toFixed(3)),
    dailyWasteKg: Number(rollingDailyWaste.toFixed(1)),

    carbonSavedKg: Number(
      (rollingDailyWaste * carbonFactor * completion).toFixed(1)
    ),
    waterSavedL: Math.round(
      rollingDailyWaste * waterFactor * completion
    ),
  };
}
