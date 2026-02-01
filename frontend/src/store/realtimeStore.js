import { create } from 'zustand';

export const useRealtimeStore = create((set, get) => ({
  systemStatus: { status: 'online', message: 'FULLY OPERATIONAL', source: '' },
  queueCount: 0,
  congestionLevel: 'low',
  waitMinutes: 0,
  confidence: 0,
  bestTimeToArrive: null,
  capacityPercent: 0,
  processRate: 45,
  shockEvent: null,
  alerts: [],
  sustainability: null,
  setSystemStatus: (v) => set({ systemStatus: v }),
  setQueueUpdate: (data) =>
    set({
      queueCount: data.queueCount ?? get().queueCount,
      congestionLevel: data.congestionLevel ?? get().congestionLevel,
      capacityPercent: data.capacityPercent ?? get().capacityPercent,
      processRate: data.processRate ?? get().processRate,
    }),
  setWaitPrediction: (data) =>
    set({
      waitMinutes: data.waitMinutes ?? get().waitMinutes,
      confidence: data.confidence ?? get().confidence,
      bestTimeToArrive: data.bestTimeToArrive ?? get().bestTimeToArrive,
    }),
  setShockEvent: (v) => set({ shockEvent: v }),
  addAlert: (alert) =>
    set((s) => ({
      alerts: [{ ...alert, id: `${Date.now()}-${Math.random()}` }, ...s.alerts].slice(0, 50),
    })),
  setSustainability: (v) => set({ sustainability: v }),
  clearAlerts: () => set({ alerts: [] }),
}));
