import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config.js';
import { attachSocketHandlers } from './socket/socketHandler.js';
import { startSimulation } from './services/simulatedSensors.js';
import { eventBus, EVENTS } from './services/eventBus.js';
import * as store from './store/analyticsStore.js';

import authRoutes from './routes/auth.js';
import systemRoutes from './routes/system.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import staffRoutes from './routes/staff.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: config.corsOrigin },
  path: '/socket.io',
});

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/staff', staffRoutes);

attachSocketHandlers(io);

eventBus.on(EVENTS.ALERT, (data) => store.pushDailySummary({ type: 'alert', ...data }));
eventBus.on(EVENTS.SHOCK_EVENT, (data) => store.pushDailySummary({ type: 'shock', ...data }));
eventBus.on(EVENTS.SHOCK_RESOLVED, (data) => store.pushDailySummary({ type: 'shock_resolved', ...data }));
eventBus.on(EVENTS.FAIRNESS_VIOLATION, (data) => store.pushAuditEvent(data));
eventBus.on(EVENTS.AUDIT_EVENT, (data) => store.pushAuditEvent(data));
eventBus.on(EVENTS.SUSTAINABILITY_UPDATE, (data) => store.pushSustainability(data));

startSimulation();

httpServer.listen(config.port, () => {
  console.log(`Backend: http://localhost:${config.port}`);
  console.log(`Socket.IO: attached`);
});
