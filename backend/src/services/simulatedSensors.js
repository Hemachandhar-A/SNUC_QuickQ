import { eventBus, EVENTS } from './eventBus.js';
import { config } from '../config.js';
import * as intelligence from './intelligenceEngine.js';

const SHOCK_TYPES = [
  { id: 'gas', label: 'Gas Delay' },
  { id: 'power', label: 'Power Issue' },
  { id: 'staff', label: 'Staff Shortage' },
  { id: 'service', label: 'Service Delay' },
];

let queueInterval;
let predictionInterval;
let shockCheckInterval;
let sustainabilityInterval;

function randomDelta() {
  const r = Math.random();
  if (r < 0.2) return -4 - Math.floor(Math.random() * 4);
  if (r < 0.5) return -2;
  if (r < 0.8) return 2;
  return 3 + Math.floor(Math.random() * 6);
}

function maybeTriggerShock() {
  if (intelligence.getActiveShock()) return;
  if (Math.random() > config.simulation.shockEventChancePerCycle) return;
  const type = SHOCK_TYPES[Math.floor(Math.random() * SHOCK_TYPES.length)];
  intelligence.setShockEvent({
    type: type.label,
    id: type.id,
    message: `${type.label} has been detected. Please remain in your current location until further notice.`,
    startedAt: new Date().toISOString(),
  });
  eventBus.emit(EVENTS.ALERT, {
    type: 'shock',
    severity: 'critical',
    title: type.label,
    message: type.message,
    timestamp: new Date().toISOString(),
  });
}

function maybeFairnessViolation() {
  if (Math.random() > config.simulation.fairnessViolationChancePerCycle) return;
  const types = ['re_entry_violation', 'priority_override', 'staff_override'];
  const t = types[Math.floor(Math.random() * types.length)];
  eventBus.emit(EVENTS.FAIRNESS_VIOLATION, {
    eventType: t,
    userId: `USR-****-${1000 + Math.floor(Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
  });
  eventBus.emit(EVENTS.AUDIT_EVENT, {
    eventType: t,
    userId: `USR-****-${1000 + Math.floor(Math.random() * 9000)}`,
    action: t === 'staff_override' ? 'Manual Approval by OP-02' : 'Access Blocked / Turnstile Locked',
    riskLevel: t === 'staff_override' ? 'amber' : 'red',
    timestamp: new Date().toISOString(),
  });
}

export function startSimulation() {
  queueInterval = setInterval(() => {
    intelligence.tick(randomDelta());
    maybeTriggerShock();
    maybeFairnessViolation();
  }, config.simulation.queueUpdateIntervalMs);

  predictionInterval = setInterval(() => {
    const state = intelligence.getQueueState();
    if (!intelligence.getActiveShock()) {
      eventBus.emit(EVENTS.WAIT_PREDICTION, {
        queueCount: state.queueCount,
        congestionLevel: state.congestionLevel,
        timestamp: new Date().toISOString(),
      });
    }
  }, config.simulation.waitPredictionIntervalMs);

  shockCheckInterval = setInterval(maybeTriggerShock, 15000);

  sustainabilityInterval = setInterval(() => {
    const wasteTrend = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
    const score = 70 + Math.floor(Math.random() * 25);
    eventBus.emit(EVENTS.SUSTAINABILITY_UPDATE, {
      sustainabilityScore: score,
      wasteTrend,
      mostEatenMeal: ['Chicken Biryani', 'Dal Rice', 'Paneer Curry'][Math.floor(Math.random() * 3)],
      highWasteWindow: wasteTrend === 'high' ? { start: '13:15', end: '13:45', zone: 'B' } : null,
      timestamp: new Date().toISOString(),
    });
  }, config.simulation.sustainabilityUpdateIntervalMs);

  eventBus.emit(EVENTS.SYSTEM_STATUS, intelligence.getSystemStatus());
}

export function stopSimulation() {
  if (queueInterval) clearInterval(queueInterval);
  if (predictionInterval) clearInterval(predictionInterval);
  if (shockCheckInterval) clearInterval(shockCheckInterval);
  if (sustainabilityInterval) clearInterval(sustainabilityInterval);
}
