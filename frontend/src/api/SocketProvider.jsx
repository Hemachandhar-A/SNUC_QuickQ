import { useEffect, useRef } from 'react';
import { createSocket, SOCKET_EVENTS } from './socket';
import { useRealtimeStore } from '../store/realtimeStore';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const setSystemStatus = useRealtimeStore((s) => s.setSystemStatus);
  const setQueueUpdate = useRealtimeStore((s) => s.setQueueUpdate);
  const setWaitPrediction = useRealtimeStore((s) => s.setWaitPrediction);
  const setShockEvent = useRealtimeStore((s) => s.setShockEvent);
  const addAlert = useRealtimeStore((s) => s.addAlert);
  const setSustainability = useRealtimeStore((s) => s.setSustainability);
  const setStaffState = useRealtimeStore((s) => s.setStaffState);
  const setDetection = useRealtimeStore((s) => s.setDetection);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on(SOCKET_EVENTS.SYSTEM_STATUS, setSystemStatus);
    socket.on(SOCKET_EVENTS.QUEUE_UPDATE, setQueueUpdate);
    socket.on(SOCKET_EVENTS.WAIT_PREDICTION, (data) => {
      setWaitPrediction(data);
      if (data.queueCount !== undefined) setQueueUpdate(data);
    });
    socket.on(SOCKET_EVENTS.SHOCK_EVENT, setShockEvent);
    socket.on(SOCKET_EVENTS.SHOCK_RESOLVED, () => setShockEvent(null));
    socket.on(SOCKET_EVENTS.ALERT, addAlert);
    socket.on(SOCKET_EVENTS.SUSTAINABILITY_UPDATE, setSustainability);
    socket.on(SOCKET_EVENTS.STAFF_STATE, setStaffState);
    socket.on(SOCKET_EVENTS.DETECTION_UPDATE, setDetection);

    return () => {
      socket.off(SOCKET_EVENTS.SYSTEM_STATUS);
      socket.off(SOCKET_EVENTS.QUEUE_UPDATE);
      socket.off(SOCKET_EVENTS.WAIT_PREDICTION);
      socket.off(SOCKET_EVENTS.SHOCK_EVENT);
      socket.off(SOCKET_EVENTS.SHOCK_RESOLVED);
      socket.off(SOCKET_EVENTS.ALERT);
      socket.off(SOCKET_EVENTS.SUSTAINABILITY_UPDATE);
      socket.off(SOCKET_EVENTS.STAFF_STATE);
      socket.off(SOCKET_EVENTS.DETECTION_UPDATE);
      socket.disconnect();
    };
  }, [setSystemStatus, setQueueUpdate, setWaitPrediction, setShockEvent, addAlert, setSustainability, setStaffState, setDetection]);

  return children;
}
