import { Router } from 'express';
import * as intelligence from '../services/intelligenceEngine.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json(intelligence.getSystemStatus());
});

router.get('/queue', (_req, res) => {
  res.json(intelligence.getQueueState());
});

router.get('/stats', (_req, res) => {
  const state = intelligence.getQueueState();
  const status = intelligence.getSystemStatus();
  res.json({
    ...state,
    ...status,
    flowPerHour: state.flowPerHour ?? state.processRate * 60,
  });
});

export default router;
