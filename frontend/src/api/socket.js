import { io } from 'socket.io-client';

// In dev, connect directly to backend to avoid Vite proxy ws ECONNABORTED on disconnect/HMR
const socketBase =
  import.meta.env.DEV && import.meta.env.VITE_SOCKET_URL
    ? import.meta.env.VITE_SOCKET_URL
    : import.meta.env.DEV
      ? 'http://localhost:3001'
      : window.location.origin;

export function createSocket() {
  return io(socketBase, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
}

export const SOCKET_EVENTS = {
  QUEUE_UPDATE: 'QUEUE_UPDATE',
  WAIT_PREDICTION: 'WAIT_PREDICTION',
  SHOCK_EVENT: 'SHOCK_EVENT',
  SHOCK_RESOLVED: 'SHOCK_RESOLVED',
  ALERT: 'ALERT',
  FAIRNESS_VIOLATION: 'FAIRNESS_VIOLATION',
  SUSTAINABILITY_UPDATE: 'SUSTAINABILITY_UPDATE',
  SYSTEM_STATUS: 'SYSTEM_STATUS',
  DAILY_SUMMARY: 'DAILY_SUMMARY',
  AUDIT_EVENT: 'AUDIT_EVENT',
  STAFF_STATE: 'STAFF_STATE',
  DETECTION_UPDATE: 'DETECTION_UPDATE',
};
