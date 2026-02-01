export const config = {
  port: process.env.PORT || 3001,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  simulation: {
    queueUpdateIntervalMs: 4000,
    waitPredictionIntervalMs: 5000,
    shockEventChancePerCycle: 0.03,
    fairnessViolationChancePerCycle: 0.02,
    sustainabilityUpdateIntervalMs: 8000,
  },
};
