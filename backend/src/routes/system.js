import { Router } from 'express';
import * as intelligence from '../services/intelligenceEngine.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json(intelligence.getSystemStatus());
});

router.get('/queue', (_req, res) => {
  res.json(intelligence.getQueueState());
});

export default router;
