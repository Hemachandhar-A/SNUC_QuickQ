import { eventBus, EVENTS } from './eventBus.js';
import { predictWait, getBestTimeToArrive } from './mlPlaceholder.js';
import * as db from '../db/index.js';

let queueCount = 28;
let congestionLevel = 'medium';
let activeShock = null;
let entryEnabled = true; // in-memory cache; db is source of truth
const PROCESS_RATE = 12; // small mess: at most 12 people per minute
const MAX_QUEUE = 80;

function syncEntryEnabledFromDb() {
  const state = db.getStaffState();
  entryEnabled = state.entry_enabled === true || state.entry_enabled === '1';
}
syncEntryEnabledFromDb();

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
    capacityPercent: Math.min(100, Math.round((queueCount / MAX_QUEUE) * 100)),
    timestamp: new Date().toISOString(),
  });
}

export function setEntryEnabled(enabled) {
  entryEnabled = !!enabled;
}

export function isEntryEnabled() {
  return entryEnabled;
}

export function getSystemStatus() {
  syncEntryEnabledFromDb();
  return {
    status: activeShock ? 'limited' : entryEnabled ? 'online' : 'limited',
    message: activeShock ? `Incident: ${activeShock.type}` : entryEnabled ? 'FULLY OPERATIONAL' : 'Entry disabled by staff',
    source: 'Main Hall Mess',
    shockEvent: activeShock,
    entryEnabled,
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
  if (!entryEnabled) return; // no queue change when entry disabled
  queueCount = Math.max(0, Math.min(MAX_QUEUE, queueCount + queueDelta));
  if (queueCount > 50) congestionLevel = 'high';
  else if (queueCount > 25) congestionLevel = 'medium';
  else congestionLevel = 'low';
  emitQueueUpdate();
  emitWaitPrediction();
}

export function getQueueState() {
  return { queueCount, congestionLevel, processRate: PROCESS_RATE };
}
