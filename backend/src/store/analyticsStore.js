/**
 * In-memory analytics store for simulation. Replace with DB in production.
 */

const dailySummary = [];
const auditLog = [];
const heatmapCells = new Map();
const sustainabilityLog = [];
const temporalFlowSamples = []; // { timestamp, queueCount, waitMinutes, capacityPercent }

const MAX_DAILY = 200;
const MAX_AUDIT = 2000;
const MAX_SUSTAINABILITY = 500;
const MAX_TEMPORAL = 7 * 24 * 60; // 7 days at 1 sample/min

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

// Realistic baseline intensity by hour (mess peaks: breakfast 7–9, lunch 12–14, dinner 19–21)
function baselineSeverityByHour(hour) {
  if (hour >= 7 && hour <= 9) return 45 + Math.random() * 25;
  if (hour >= 12 && hour <= 14) return 55 + Math.random() * 35;
  if (hour >= 19 && hour <= 21) return 50 + Math.random() * 30;
  if (hour >= 6 && hour <= 22) return 15 + Math.random() * 25;
  return 5 + Math.random() * 15;
}

export function getHeatmapData(days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = temporalFlowSamples.filter((s) => new Date(s.timestamp).getTime() >= cutoff);

  const byCell = new Map();
  for (const s of filtered) {
    const dt = new Date(s.timestamp);
    const dayKey = dt.toISOString().slice(0, 10);
    const hour = dt.getHours();
    const slot = `${String(hour).padStart(2, '0')}:00`;
    const key = `${dayKey}-${slot}`;
    if (!byCell.has(key)) byCell.set(key, { sum: 0, count: 0 });
    const cell = byCell.get(key);
    cell.sum += s.capacityPercent ?? 0;
    cell.count += 1;
  }

  const result = [];
  for (let d = 0; d < days; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayKey = date.toISOString().slice(0, 10);
    for (let h = 0; h < 24; h++) {
      const slot = `${String(h).padStart(2, '0')}:00`;
      const key = `${dayKey}-${slot}`;
      const cell = byCell.get(key);
      let severity = 0;
      const events = [];
      if (cell && cell.count > 0) {
        severity = Math.min(100, Math.round(cell.sum / cell.count));
      } else {
        severity = Math.min(100, Math.round(baselineSeverityByHour(h)));
      }
      const stored = heatmapCells.get(key);
      if (stored && stored.events && stored.events.length) events.push(...stored.events);
      result.push({ dayKey, timeSlot: slot, severity, events });
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

export function pushTemporalFlow(sample) {
  temporalFlowSamples.unshift({
    timestamp: new Date().toISOString(),
    queueCount: sample.queueCount ?? 0,
    waitMinutes: sample.waitMinutes ?? 0,
    capacityPercent: sample.capacityPercent ?? 0,
  });
  if (temporalFlowSamples.length > MAX_TEMPORAL) temporalFlowSamples.pop();
}

export function getTemporalFlow(days = 7) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = temporalFlowSamples.filter((s) => new Date(s.timestamp).getTime() >= cutoff);
  const byDay = new Map();
  for (const s of filtered) {
    const dayKey = s.timestamp.slice(0, 10);
    if (!byDay.has(dayKey)) {
      byDay.set(dayKey, { dayKey, samples: [], avgWait: 0, avgQueue: 0, avgCapacity: 0, peakHour: 0 });
    }
    const row = byDay.get(dayKey);
    row.samples.push(s);
  }
  const result = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const dayKey = date.toISOString().slice(0, 10);
    const row = byDay.get(dayKey);
    if (row && row.samples.length > 0) {
      const n = row.samples.length;
      row.avgWait = Math.round(row.samples.reduce((a, x) => a + (x.waitMinutes ?? 0), 0) / n);
      row.avgQueue = Math.round(row.samples.reduce((a, x) => a + (x.queueCount ?? 0), 0) / n);
      row.avgCapacity = Math.round(row.samples.reduce((a, x) => a + (x.capacityPercent ?? 0), 0) / n);
      result.push(row);
    } else {
      result.push({
        dayKey,
        avgWait: 0,
        avgQueue: 0,
        avgCapacity: 0,
        samples: [],
      });
    }
  }
  return result;
}

export function getOverviewKpis() {
  const flow = getTemporalFlow(7);
  const validFlow = flow.filter((r) => r.samples && r.samples.length > 0);
  const avgWait = validFlow.length
    ? Math.round(validFlow.reduce((a, r) => a + r.avgWait, 0) / validFlow.length)
    : 5;
  const peakDay = validFlow.length ? validFlow.reduce((a, r) => (r.avgCapacity > (a.avgCapacity || 0) ? r : a), {}) : null;
  const auditStats = getAuditStats();
  const sust = sustainabilityLog.slice(0, 10);
  const sustScore = sust.length ? Math.round(sust.reduce((a, e) => a + (e.sustainabilityScore ?? 75), 0) / sust.length) : 92;
  return {
    avgWaitMinutes: avgWait,
    peakCongestionDay: peakDay?.dayKey || new Date().toISOString().slice(0, 10),
    peakCongestionHour: peakDay ? '12:00' : '12:00',
    fairnessIncidents24h: auditStats.flagged24h || 0,
    sustainabilityScore: sustScore,
    temporalFlow: flow,
  };
}
