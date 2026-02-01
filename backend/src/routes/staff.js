import { Router } from 'express';
import * as intelligence from '../services/intelligenceEngine.js';
import * as store from '../store/analyticsStore.js';
import { eventBus, EVENTS } from '../services/eventBus.js';
import * as db from '../db/index.js';

const router = Router();
const SHOCK_TYPES = [
  { id: 'gas', label: 'Gas Delay' },
  { id: 'power', label: 'Power Issue' },
  { id: 'staff', label: 'Staff Shortage' },
  { id: 'service', label: 'Service Delay' },
];

// ——— Shock ———
router.post('/shock/trigger', (req, res) => {
  const { type } = req.body || {};
  const found = SHOCK_TYPES.find((t) => t.id === type || t.label === type) || SHOCK_TYPES[0];
  const event = {
    type: found.label,
    id: found.id,
    message: `${found.label} has been detected. Please remain in your current location until further notice.`,
    startedAt: new Date().toISOString(),
  };
  intelligence.setShockEvent(event);
  eventBus.emit(EVENTS.ALERT, {
    type: 'shock',
    severity: 'critical',
    title: found.label,
    message: event.message,
    timestamp: new Date().toISOString(),
  });
  store.pushDailySummary({ type: 'shock', ...event });
  res.json({ ok: true, event });
});

router.post('/shock/resolve', (_req, res) => {
  intelligence.clearShockEvent();
  store.pushDailySummary({ type: 'shock_resolved', timestamp: new Date().toISOString() });
  res.json({ ok: true });
});

router.get('/shock/status', (_req, res) => {
  res.json({ active: intelligence.getActiveShock() });
});

// ——— Staff state (entry, alerts, AI feed) ———
router.get('/state', (_req, res) => {
  try {
    const state = db.getStaffState();
    res.json({ ok: true, ...state });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/entry', (req, res) => {
  try {
    const enabled = req.body?.enabled !== false;
    const state = db.setEntryEnabled(enabled);
    intelligence.setEntryEnabled(enabled);
    eventBus.emit(EVENTS.STAFF_STATE, state);
    eventBus.emit(EVENTS.SYSTEM_STATUS, intelligence.getSystemStatus());
    res.json({ ok: true, entryEnabled: enabled, ...state });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/alert', (req, res) => {
  try {
    const { type = 'manual', title, message, severity = 'warning' } = req.body || {};
    const alert = db.addAlert({ type, title: title || 'Staff Alert', message, severity });
    eventBus.emit(EVENTS.ALERT, {
      id: alert.id,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.created_at,
    });
    store.pushDailySummary({ type: 'alert', ...alert });
    res.json({ ok: true, alert });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/alerts/count', (_req, res) => {
  try {
    const count = db.getActiveAlertCount();
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/ai-feed', (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const unresolvedOnly = req.query.unresolved === 'true';
    const items = db.getAiFeedItems(limit, unresolvedOnly);
    res.json({ ok: true, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/ai-feed/:id/resolve', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
    const item = db.resolveAiFeedItem(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    eventBus.emit(EVENTS.STAFF_STATE, { aiFeedResolved: id });
    res.json({ ok: true, item });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/ai-feed/resolve-all', (_req, res) => {
  try {
    const items = db.resolveAllAiFeedItems();
    eventBus.emit(EVENTS.STAFF_STATE, { aiFeedResolvedAll: true });
    res.json({ ok: true, items });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
