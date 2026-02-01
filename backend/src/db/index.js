/**
 * SQLite persistence for staff state, alerts, and AI operations feed.
 * Shared across dashboards via API + Socket.
 */

import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../../data');
const dbPath = join(dataDir, 'hostel.db');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS staff_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    severity TEXT DEFAULT 'info',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ai_feed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    action_type TEXT,
    resolved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_ai_feed_resolved ON ai_feed(resolved, created_at DESC);
`);

// Default staff state
const defaultState = db.prepare("SELECT 1 FROM staff_state WHERE key = 'entry_enabled'").get();
if (!defaultState) {
  db.prepare("INSERT INTO staff_state (key, value) VALUES ('entry_enabled', '1')").run();
}

// Seed AI feed if empty
const aiCount = db.prepare('SELECT COUNT(*) AS c FROM ai_feed').get();
if (aiCount && aiCount.c === 0) {
  const seed = [
    { type: 'predictive_rush', title: 'Predictive Rush: Sector B', message: 'Flow increase expected in 10 mins. Staffing at capacity.', action_type: 'execute' },
    { type: 'efficiency', title: 'Optimal Efficiency Reached', message: 'Current entry rate is balanced with exit flow. No changes required.', action_type: null },
    { type: 'delay_resolved', title: 'Mark Delay Resolved?', message: 'Station maintenance complete. Suggest re-enabling full access.', action_type: 'resolve' },
  ];
  const insert = db.prepare('INSERT INTO ai_feed (type, title, message, action_type) VALUES (?, ?, ?, ?)');
  for (const row of seed) insert.run(row.type, row.title, row.message, row.action_type);
}

export function getStaffState() {
  const rows = db.prepare('SELECT key, value, updated_at FROM staff_state').all();
  const state = {};
  for (const r of rows) {
    state[r.key] = r.key === 'entry_enabled' ? r.value === '1' : r.value;
    state[`${r.key}_updated_at`] = r.updated_at;
  }
  return state;
}

export function setEntryEnabled(enabled) {
  db.prepare("UPDATE staff_state SET value = ?, updated_at = datetime('now') WHERE key = 'entry_enabled'").run(enabled ? '1' : '0');
  return getStaffState();
}

export function addAlert({ type, title, message, severity = 'info' }) {
  const stmt = db.prepare('INSERT INTO alerts (type, title, message, severity) VALUES (?, ?, ?, ?)');
  const run = stmt.run(type, title || type, message || '', severity);
  const row = db.prepare('SELECT * FROM alerts WHERE id = ?').get(run.lastInsertRowid);
  return row;
}

export function getAlerts(limit = 50) {
  return db.prepare('SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function getActiveAlertCount() {
  const row = db.prepare(
    "SELECT COUNT(*) AS c FROM alerts WHERE created_at > datetime('now', '-24 hours')"
  ).get();
  return row?.c ?? 0;
}

export function addAiFeedItem({ type, title, message, action_type }) {
  const stmt = db.prepare('INSERT INTO ai_feed (type, title, message, action_type) VALUES (?, ?, ?, ?)');
  const run = stmt.run(type, title, message || '', action_type || null);
  const row = db.prepare('SELECT * FROM ai_feed WHERE id = ?').get(run.lastInsertRowid);
  return row;
}

export function getAiFeedItems(limit = 20, unresolvedOnly = false) {
  let sql = 'SELECT * FROM ai_feed';
  if (unresolvedOnly) sql += ' WHERE resolved = 0';
  sql += ' ORDER BY created_at DESC LIMIT ?';
  return db.prepare(sql).all(limit);
}

export function resolveAiFeedItem(id) {
  db.prepare('UPDATE ai_feed SET resolved = 1 WHERE id = ?').run(id);
  return db.prepare('SELECT * FROM ai_feed WHERE id = ?').get(id);
}

export function resolveAllAiFeedItems() {
  db.prepare('UPDATE ai_feed SET resolved = 1 WHERE resolved = 0').run();
  return getAiFeedItems(50);
}

export { db };
