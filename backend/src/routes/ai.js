import { Router } from 'express';
import * as ml from '../services/mlPlaceholder.js';

const router = Router();

router.post('/predict_wait', (req, res) => {
  try {
    const out = ml.predictWait(req.body);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/forecast_demand', (req, res) => {
  try {
    const out = ml.forecastDemand(req.body);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/detect_queue', (req, res) => {
  try {
    const out = ml.detectQueue(req.body);
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
