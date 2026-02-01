import { io } from 'socket.io-client';

const SOCKET_PATH = import.meta.env.DEV ? '' : '';
const base = window.location.origin;

export function createSocket() {
  return io(base, {
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
};
