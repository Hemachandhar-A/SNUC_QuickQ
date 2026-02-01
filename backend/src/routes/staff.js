import { Router } from 'express';
import * as intelligence from '../services/intelligenceEngine.js';
import * as store from '../store/analyticsStore.js';
import { eventBus, EVENTS } from '../services/eventBus.js';

const router = Router();
const SHOCK_TYPES = [
  { id: 'gas', label: 'Gas Delay' },
  { id: 'power', label: 'Power Issue' },
  { id: 'staff', label: 'Staff Shortage' },
  { id: 'service', label: 'Service Delay' },
];

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

export default router;
