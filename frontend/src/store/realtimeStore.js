import { create } from 'zustand';

export const useRealtimeStore = create((set, get) => ({
  systemStatus: { status: 'online', message: 'FULLY OPERATIONAL', source: '' },
  queueCount: 0,
  congestionLevel: 'low',
  waitMinutes: 0,
  confidence: 0,
  bestTimeToArrive: null,
  capacityPercent: 0,
  processRate: 12,
  activeStaff: 4,
  flowPerHour: 720,
  shockEvent: null,
  shockOrAlertActive: false,
  alerts: [],
  sustainability: null,
  // Staff state (entry enabled, etc.) — shared across dashboards
  staffState: { entry_enabled: true },
  // Live detection (queue monitor): boxes, fps, latency, temp
  detection: null,
  // Last N capacity % for congestion trend (Staff Dashboard)
  queueHistory: [],
  setSystemStatus: (v) =>
    set((s) => ({
      systemStatus: v,
      ...(v && typeof v === 'object' && v.processRate != null && { processRate: v.processRate }),
      ...(v && typeof v === 'object' && v.activeStaff != null && { activeStaff: v.activeStaff }),
      ...(v && typeof v === 'object' && v.flowPerHour != null && { flowPerHour: v.flowPerHour }),
    })),
  setQueueUpdate: (data) =>
    set((s) => {
      const capacityPercent = data.capacityPercent ?? s.capacityPercent ?? 0;
      const history = [capacityPercent, ...s.queueHistory].slice(0, 30);
      return {
        queueCount: data.queueCount ?? s.queueCount,
        congestionLevel: data.congestionLevel ?? s.congestionLevel,
        capacityPercent,
        processRate: data.processRate ?? s.processRate,
        activeStaff: data.activeStaff ?? s.activeStaff,
        flowPerHour: data.flowPerHour ?? s.flowPerHour,
        queueHistory: history,
      };
    }),
  setWaitPrediction: (data) =>
    set({
      waitMinutes: data.waitMinutes ?? get().waitMinutes,
      confidence: data.confidence ?? get().confidence,
      bestTimeToArrive: data.bestTimeToArrive ?? get().bestTimeToArrive,
      shockOrAlertActive: data.shockOrAlertActive ?? get().shockOrAlertActive,
    }),
  setShockEvent: (v) => set({ shockEvent: v }),
  addAlert: (alert) =>
    set((s) => ({
      alerts: [{ ...alert, id: alert.id ?? `${Date.now()}-${Math.random()}` }, ...s.alerts].slice(0, 50),
    })),
  setSustainability: (v) => set({ sustainability: v }),
  clearAlerts: () => set({ alerts: [] }),
  setStaffState: (v) => set({ staffState: typeof v === 'object' ? { ...get().staffState, ...v } : v }),
  setDetection: (v) => set({ detection: v }),
}));
