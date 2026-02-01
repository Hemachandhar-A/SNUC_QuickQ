import { eventBus, EVENTS } from './eventBus.js';
import { config } from '../config.js';
import * as intelligence from './intelligenceEngine.js';
import * as ml from './mlPlaceholder.js';
import * as store from '../store/analyticsStore.js';
import { simulateSustainability } from './sustainabilitySim.js';

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
  if (r < 0.25) return -2 - Math.floor(Math.random() * 2);
  if (r < 0.5) return -1;
  if (r < 0.8) return 1;
  return 2 + Math.floor(Math.random() * 2);
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
    const shockActive = !!intelligence.getActiveShock();
    const pred = ml.predictWait({
      queueCount: state.queueCount,
      sectorId: 'main',
      shockOrAlertActive: shockActive,
    });
    const best = ml.getBestTimeToArrive(state.queueCount, state.processRate);
    const capacityPercent = Math.min(100, Math.round((state.queueCount / (state.maxQueue || 80)) * 100));
    store.pushTemporalFlow({
      queueCount: state.queueCount,
      waitMinutes: pred.waitMinutes,
      capacityPercent,
    });
    eventBus.emit(EVENTS.WAIT_PREDICTION, {
      waitMinutes: pred.waitMinutes,
      confidence: pred.confidence,
      queueCount: state.queueCount,
      congestionLevel: state.congestionLevel,
      bestTimeToArrive: best,
      shockOrAlertActive: shockActive,
      timestamp: new Date().toISOString(),
    });
  }, config.simulation.waitPredictionIntervalMs);

  shockCheckInterval = setInterval(maybeTriggerShock, 15000);

  sustainabilityInterval = setInterval(() => {
    const queueState = intelligence.getQueueState();
    const congestionMap = { high: 'HIGH', medium: 'MEDIUM', low: 'LOW' };
    const payload = simulateSustainability({
      queueSize: queueState.queueCount,
      congestion: congestionMap[queueState.congestionLevel] || 'MEDIUM',
      sensorConfidence: 0.9 + Math.random() * 0.08,
    });
    eventBus.emit(EVENTS.SUSTAINABILITY_UPDATE, {
      ...payload,
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
