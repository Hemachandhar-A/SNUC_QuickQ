/**
 * In-memory analytics store for simulation. Replace with DB in production.
 */

const dailySummary = [];
const auditLog = [];
const heatmapCells = new Map();
const sustainabilityLog = [];

const MAX_DAILY = 200;
const MAX_AUDIT = 2000;
const MAX_SUSTAINABILITY = 500;

export function pushDailySummary(event) {
  dailySummary.unshift({ id: Date.now(), ...event, timestamp: new Date().toISOString() });
  if (dailySummary.length > MAX_DAILY) dailySummary.pop();
}

export function getDailySummary(limit = 20) {
  return dailySummary.slice(0, limit);
}

export function pushAuditEvent(event) {
  auditLog.unshift({ id: `audit-${Date.now()}`, ...event });
  if (auditLog.length > MAX_AUDIT) auditLog.pop();
}

export function getAuditLog(filters = {}, limit = 100, offset = 0) {
  let list = [...auditLog];
  if (filters.eventType) list = list.filter((e) => e.eventType === filters.eventType);
  if (filters.riskLevel) list = list.filter((e) => e.riskLevel === filters.riskLevel);
  return list.slice(offset, offset + limit);
}

export function getAuditStats() {
  const last24h = auditLog.filter((e) => {
    const t = new Date(e.timestamp || e.id).getTime();
    return t > Date.now() - 24 * 60 * 60 * 1000;
  });
  return {
    total: auditLog.length,
    flagged24h: last24h.length,
    byType: last24h.reduce((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {}),
  };
}

export function setHeatmapCell(dayKey, timeSlot, value) {
  const key = `${dayKey}-${timeSlot}`;
  heatmapCells.set(key, { dayKey, timeSlot, ...value });
}

export function getHeatmapData(days = 7) {
  const result = [];
  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayKey = date.toISOString().slice(0, 10);
    for (let h = 0; h < 24; h++) {
      const slot = `${String(h).padStart(2, '0')}:00`;
      const k = `${dayKey}-${slot}`;
      result.push(heatmapCells.get(k) || { dayKey, timeSlot: slot, severity: 0, events: [] });
    }
  }
  return result;
}

export function pushSustainability(entry) {
  sustainabilityLog.unshift({ id: Date.now(), ...entry });
  if (sustainabilityLog.length > MAX_SUSTAINABILITY) sustainabilityLog.pop();
}

export function getSustainabilityLog(limit = 50) {
  return sustainabilityLog.slice(0, limit);
}
