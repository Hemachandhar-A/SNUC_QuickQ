import { eventBus, EVENTS } from './eventBus.js';
import { predictWait, getBestTimeToArrive } from './mlPlaceholder.js';

let queueCount = 85;
let congestionLevel = 'medium';
let activeShock = null;
const PROCESS_RATE = 45;

function emitWaitPrediction() {
  const result = predictWait({ queueCount, sectorId: 'main' });
  const best = getBestTimeToArrive(queueCount, PROCESS_RATE);
  eventBus.emit(EVENTS.WAIT_PREDICTION, {
    waitMinutes: result.waitMinutes,
    confidence: result.confidence,
    queueCount,
    bestTimeToArrive: best,
  });
}

function emitQueueUpdate() {
  eventBus.emit(EVENTS.QUEUE_UPDATE, {
    queueCount,
    congestionLevel,
    processRate: PROCESS_RATE,
    capacityPercent: Math.min(100, Math.round((queueCount / 200) * 100)),
    timestamp: new Date().toISOString(),
  });
}

export function getSystemStatus() {
  return {
    status: activeShock ? 'limited' : 'online',
    message: activeShock ? `Incident: ${activeShock.type}` : 'FULLY OPERATIONAL',
    source: 'Main Hall Mess',
    shockEvent: activeShock,
    timestamp: new Date().toISOString(),
  };
}

export function setShockEvent(event) {
  activeShock = event;
  eventBus.emit(EVENTS.SHOCK_EVENT, event);
}

export function clearShockEvent() {
  if (activeShock) {
    eventBus.emit(EVENTS.SHOCK_RESOLVED, { previous: activeShock });
    activeShock = null;
  }
}

export function getActiveShock() {
  return activeShock;
}

export function tick(queueDelta) {
  if (activeShock) return;
  queueCount = Math.max(0, Math.min(250, queueCount + queueDelta));
  if (queueCount > 120) congestionLevel = 'high';
  else if (queueCount > 60) congestionLevel = 'medium';
  else congestionLevel = 'low';
  emitQueueUpdate();
  emitWaitPrediction();
}

export function getQueueState() {
  return { queueCount, congestionLevel, processRate: PROCESS_RATE };
}
