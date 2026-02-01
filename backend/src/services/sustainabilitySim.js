/**
 * Backend sustainability model — same logic as frontend for closed simulation.
 * Calibrated for 600–1200 meals/day and 10–60kg daily waste.
 */

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function gaussianNoise(mean = 0, std = 1) {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function timeBias(hour) {
  if (hour >= 7 && hour <= 9) return 1.1;
  if (hour >= 12 && hour <= 14) return 1.4;
  if (hour >= 19 && hour <= 21) return 1.5;
  return 0.6;
}

function congestionPenalty(level) {
  const L = (level || '').toUpperCase();
  if (L === 'HIGH') return 0.18;
  if (L === 'LOW') return -0.05;
  return 0;
}

let rollingDailyWaste = 25 + Math.random() * 10;

export function simulateSustainability({
  queueSize = 120,
  congestion = 'MEDIUM',
  sensorConfidence = 0.92,
} = {}) {
  const now = new Date();
  const hour = now.getHours();

  const baseRate = 8 + Math.random() * 6;
  const flow = clamp(baseRate * timeBias(hour), 5, 16);

  const baseCompletion = 0.82;
  const noise = gaussianNoise(0, 0.03);
  const completion = clamp(
    baseCompletion - congestionPenalty(congestion) + noise,
    0.65,
    0.92
  );

  const wasteRatio = clamp(1 - completion, 0.05, 0.35);

  const wasteKgPerPlate = clamp(0.02 + gaussianNoise(0, 0.008), 0.01, 0.05);
  const wasteKgPerMin = flow * wasteRatio * wasteKgPerPlate;

  rollingDailyWaste = clamp(
    rollingDailyWaste + wasteKgPerMin * 2 + gaussianNoise(0, 0.5),
    10,
    60
  );

  const carbonFactor = 1.8;
  const waterFactor = 10;

  const congestionNorm = (congestion || 'MEDIUM').toUpperCase();

  return {
    timestamp: Date.now(),
    timestampISO: now.toISOString(),
    hour,
    queueSize,
    congestion: congestionNorm,
    sensorConfidence,

    plateRate: Math.round(flow),
    completionRatio: Number((completion * 100).toFixed(1)),
    wasteRatio: Number((wasteRatio * 100).toFixed(1)),

    wasteKgPerMin: Number(wasteKgPerMin.toFixed(3)),
    dailyWasteKg: Number(rollingDailyWaste.toFixed(1)),

    carbonSavedKg: Number(
      (rollingDailyWaste * carbonFactor * completion).toFixed(1)
    ),
    waterSavedL: Math.round(rollingDailyWaste * waterFactor * completion),

    sustainabilityScore: Math.round(completion * 100),
    wasteTrend: wasteRatio > 0.25 ? 'high' : wasteRatio > 0.15 ? 'medium' : 'low',
    mostEatenMeal: ['Chicken Biryani', 'Dal Rice', 'Paneer Curry'][Math.floor(Math.random() * 3)],
    highWasteWindow: wasteRatio > 0.22 ? { start: `${hour}:${String(now.getMinutes()).padStart(2, '0')}`, end: `${hour}:${String(now.getMinutes() + 30).padStart(2, '0')}`, zone: 'B' } : null,
  };
}
