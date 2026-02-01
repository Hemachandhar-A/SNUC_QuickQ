/**
 * ML-ready API layer. Rule-based logic now; swap handlers for real ML (e.g. Python) later.
 * Frontend and Socket events stay unchanged.
 */

import { eventBus, EVENTS } from './eventBus.js';

const PROCESS_RATE_BASE = 12; // small mess: 12 people per minute
const CAPACITY_BASE = 80;

export function predictWait(payload) {
  const { queueCount = 0, sectorId = 'main' } = payload || {};
  const rate = PROCESS_RATE_BASE;
  const waitMinutes = Math.max(0, Math.min(30, Math.round((queueCount / rate))));
  const confidence = 0.88 + Math.random() * 0.1;
  return {
    waitMinutes,
    confidence: Math.round(confidence * 100) / 100,
    queueCount,
    sectorId,
    timestamp: new Date().toISOString(),
  };
}

export function forecastDemand(payload) {
  const { scenario = 'normal', horizonHours = 24 } = payload || {};
  const now = new Date();
  const points = [];
  for (let h = 0; h < Math.min(horizonHours, 24); h++) {
    const t = new Date(now);
    t.setHours(t.getHours() + h);
    const hour = t.getHours();
    let base = 200;
    if (scenario === 'exam') {
      base += hour < 12 ? 120 : 0;
      base += hour >= 7 && hour <= 10 ? 80 : 0;
    } else if (scenario === 'weekend') {
      base = 180 + Math.sin((hour - 10) / 6) * 60;
    } else if (scenario === 'weather') {
      base += 40;
    } else {
      base += (hour >= 11 && hour <= 14 ? 150 : 0) + (hour >= 17 && hour <= 20 ? 100 : 0);
    }
    const value = Math.round(base + (Math.random() - 0.5) * 40);
    points.push({ time: t.toISOString(), hour, value });
  }
  return {
    scenario,
    horizonHours,
    points,
    confidence: 0.9 + Math.random() * 0.05,
    timestamp: new Date().toISOString(),
  };
}

export function detectQueue(payload) {
  const { zoneId = 'main', imageRef } = payload || {};
  const count = Math.floor(20 + Math.random() * 30);
  const confidence = 0.92 + Math.random() * 0.06;
  return {
    zoneId,
    count,
    confidence: Math.round(confidence * 100) / 100,
    zones: [
      { id: 'A', label: 'Entry Hall', count: Math.floor(count * 0.35) },
      { id: 'B', label: 'Counter', count: Math.floor(count * 0.45) },
      { id: 'C', label: 'Exit Path', count: Math.floor(count * 0.2) },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function getBestTimeToArrive(queueCount, processRate = PROCESS_RATE_BASE) {
  const now = new Date();
  const in15 = new Date(now.getTime() + 15 * 60 * 1000);
  const futureQueue = Math.max(0, queueCount - processRate * 0.25);
  const waitIfComeNow = (queueCount / processRate) * 60;
  const waitIfComeLater = (futureQueue / processRate) * 60;
  const saved = Math.max(0, Math.round(waitIfComeNow - waitIfComeLater));
  return {
    arriveInMinutes: 15,
    estimatedSaveMinutes: saved,
    suggestedTime: in15.toISOString(),
  };
}
