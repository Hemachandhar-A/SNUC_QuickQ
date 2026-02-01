import { eventBus, EVENTS } from '../services/eventBus.js';
import * as intelligence from '../services/intelligenceEngine.js';
import * as db from '../db/index.js';
import * as ml from '../services/mlPlaceholder.js';

export function attachSocketHandlers(io) {
  io.on('connection', (socket) => {
    socket.emit(EVENTS.SYSTEM_STATUS, intelligence.getSystemStatus());
    try {
      const staffState = db.getStaffState();
      socket.emit(EVENTS.STAFF_STATE, staffState);
    } catch (_) {}
    const state = intelligence.getQueueState();
    socket.emit(EVENTS.QUEUE_UPDATE, {
      queueCount: state.queueCount,
      congestionLevel: state.congestionLevel,
      processRate: state.processRate,
      capacityPercent: Math.min(100, Math.round((state.queueCount / 80) * 100)),
      timestamp: new Date().toISOString(),
    });
    const pred = ml.predictWait({ queueCount: state.queueCount });
    const best = ml.getBestTimeToArrive(state.queueCount, state.processRate);
    socket.emit(EVENTS.WAIT_PREDICTION, {
      waitMinutes: pred.waitMinutes,
      confidence: pred.confidence,
      queueCount: state.queueCount,
      bestTimeToArrive: best,
    });

    const onQueue = (data) => socket.emit(EVENTS.QUEUE_UPDATE, data);
    const onWait = (data) => socket.emit(EVENTS.WAIT_PREDICTION, data);
    const onShock = (data) => socket.emit(EVENTS.SHOCK_EVENT, data);
    const onShockResolved = (data) => socket.emit(EVENTS.SHOCK_RESOLVED, data);
    const onAlert = (data) => socket.emit(EVENTS.ALERT, data);
    const onFairness = (data) => socket.emit(EVENTS.FAIRNESS_VIOLATION, data);
    const onSustainability = (data) => socket.emit(EVENTS.SUSTAINABILITY_UPDATE, data);
    const onStatus = (data) => socket.emit(EVENTS.SYSTEM_STATUS, data);
    const onDaily = (data) => socket.emit(EVENTS.DAILY_SUMMARY, data);
    const onAudit = (data) => socket.emit(EVENTS.AUDIT_EVENT, data);
    const onStaffState = (data) => socket.emit(EVENTS.STAFF_STATE, data);
    const onDetection = (data) => socket.emit(EVENTS.DETECTION_UPDATE, data);

    eventBus.on(EVENTS.QUEUE_UPDATE, onQueue);
    eventBus.on(EVENTS.WAIT_PREDICTION, onWait);
    eventBus.on(EVENTS.SHOCK_EVENT, onShock);
    eventBus.on(EVENTS.SHOCK_RESOLVED, onShockResolved);
    eventBus.on(EVENTS.ALERT, onAlert);
    eventBus.on(EVENTS.FAIRNESS_VIOLATION, onFairness);
    eventBus.on(EVENTS.SUSTAINABILITY_UPDATE, onSustainability);
    eventBus.on(EVENTS.SYSTEM_STATUS, onStatus);
    eventBus.on(EVENTS.DAILY_SUMMARY, onDaily);
    eventBus.on(EVENTS.AUDIT_EVENT, onAudit);
    eventBus.on(EVENTS.STAFF_STATE, onStaffState);
    eventBus.on(EVENTS.DETECTION_UPDATE, onDetection);

    socket.on('disconnect', () => {
      eventBus.off(EVENTS.QUEUE_UPDATE, onQueue);
      eventBus.off(EVENTS.WAIT_PREDICTION, onWait);
      eventBus.off(EVENTS.SHOCK_EVENT, onShock);
      eventBus.off(EVENTS.SHOCK_RESOLVED, onShockResolved);
      eventBus.off(EVENTS.ALERT, onAlert);
      eventBus.off(EVENTS.FAIRNESS_VIOLATION, onFairness);
      eventBus.off(EVENTS.SUSTAINABILITY_UPDATE, onSustainability);
      eventBus.off(EVENTS.SYSTEM_STATUS, onStatus);
      eventBus.off(EVENTS.DAILY_SUMMARY, onDaily);
      eventBus.off(EVENTS.AUDIT_EVENT, onAudit);
      eventBus.off(EVENTS.STAFF_STATE, onStaffState);
      eventBus.off(EVENTS.DETECTION_UPDATE, onDetection);
    });
  });
}
