import { Router } from 'express';
import * as store from '../store/analyticsStore.js';

const router = Router();

router.get('/daily-summary', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  res.json(store.getDailySummary(limit));
});

router.get('/audit', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
  const offset = parseInt(req.query.offset, 10) || 0;
  const eventType = req.query.eventType;
  const riskLevel = req.query.riskLevel;
  res.json(store.getAuditLog({ eventType, riskLevel }, limit, offset));
});

router.get('/audit/stats', (_req, res) => {
  res.json(store.getAuditStats());
});

router.get('/heatmap', (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
  res.json(store.getHeatmapData(days));
});

router.get('/sustainability', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  res.json(store.getSustainabilityLog(limit));
});

router.get('/temporal-flow', (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 7, 30);
  res.json(store.getTemporalFlow(days));
});

router.get('/overview-kpis', (_req, res) => {
  res.json(store.getOverviewKpis());
});

export default router;
