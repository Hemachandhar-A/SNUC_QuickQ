import { useState, useEffect } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ai } from '../../../api/client';

export default function QueueMonitor() {
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const [confidence, setConfidence] = useState(98.4);
  const [detectionThreshold, setDetectionThreshold] = useState(0.85);
  const [nmsOverlap, setNmsOverlap] = useState(0.45);
  const [events, setEvents] = useState([
    { time: '14:23:58', msg: 'System heartbeat: 100% operational', type: 'success' },
    { time: '14:24:01', msg: 'Zone A occupancy cleared', type: 'info' },
    { time: '14:24:12', msg: 'Zone B Overflow Risk: >10 persons detected', type: 'warning' },
    { time: '14:24:15', msg: 'Large group (8 persons) detected at Mess Entry', type: 'info' },
    { time: '14:24:18', msg: 'Tracking ID_849, ID_850...', type: 'info' },
  ]);
  const [zones, setZones] = useState([
    { id: 'A', label: 'Zone A: Entry Hall', count: 8 },
    { id: 'B', label: 'Zone B: Counter', count: 12, warning: true },
    { id: 'C', label: 'Zone C: Exit Path', count: 4 },
  ]);

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const res = await ai.detectQueue({ zoneId: 'main' });
        setConfidence(res.confidence ? res.confidence * 100 : 98.4);
        if (res.zones && res.zones.length) setZones(res.zones.map((z) => ({ ...z, label: `Zone ${z.id}: ${z.label}`, warning: z.count > 10 })));
      } catch (_) {}
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Queue Detection Monitor - Mess Entry Zone</h1>
        <span className="text-sm text-gray-400">LIVE FEED: {new Date().toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardBody>
                <p className="text-xs text-gray-500 uppercase">Live Occupancy</p>
                <p className="text-4xl font-bold text-white tabular-nums mt-1">{queueCount || 24}</p>
                <p className="text-sm text-status-green mt-1">+2%</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-gray-500 uppercase">Confidence</p>
                <p className="text-4xl font-bold text-white tabular-nums mt-1">{confidence.toFixed(1)}%</p>
                <div className="mt-2 h-2 rounded-full bg-slate overflow-hidden">
                  <div className="h-full bg-accent-blue rounded-full" style={{ width: `${confidence}%` }} />
                </div>
              </CardBody>
            </Card>
          </div>
          <Card>
            <CardBody className="p-0">
              <div className="aspect-video bg-charcoal rounded-xl flex items-center justify-center relative overflow-hidden border border-slate/50">
                <div className="absolute inset-0 bg-gradient-to-br from-slate/50 to-transparent" />
                <div className="relative text-gray-500 text-sm">Simulated camera feed</div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                  {zones.map((z) => (
                    <span key={z.id} className="px-2 py-1 rounded bg-charcoal/80 border border-accent-blue/50 text-accent-cyan text-xs">
                      ZONE {z.id}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-2 py-1 rounded bg-accent-blue/20 text-accent-cyan text-xs">ID_842 [ADULT]</span>
                  <span className="px-2 py-1 rounded bg-accent-blue/20 text-accent-cyan text-xs">ID_845 [ADULT]</span>
                  <span className="px-2 py-1 rounded border border-dashed border-accent-blue text-accent-cyan text-xs">ID_839 [TRACKING]</span>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="DETECTION EVENT LOG" subtitle="REAL-TIME STREAMING" />
            <CardBody className="max-h-48 overflow-y-auto space-y-2">
              {events.map((e, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm ${e.type === 'warning' ? 'text-status-amber' : e.type === 'success' ? 'text-status-green' : 'text-gray-400'}`}>
                  <span className="tabular-nums text-gray-500">[{e.time}]</span>
                  {e.type === 'warning' && <span aria-hidden="true">▲</span>}
                  {e.msg}
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Detection Zones - Live headcounts per area." />
            <CardBody className="space-y-3">
              {zones.map((z) => (
                <div key={z.id} className={`flex items-center justify-between p-2 rounded-lg ${z.warning ? 'border border-status-amber/50 bg-status-amber/5' : ''}`}>
                  <span className="text-sm text-white">{z.label}</span>
                  <span className="font-semibold tabular-nums">{z.count}</span>
                  {z.warning && <span className="text-status-amber" aria-hidden="true">⚠</span>}
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="AI SENSITIVITY CONTROL" />
            <CardBody className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Detection Threshold: {detectionThreshold}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={detectionThreshold}
                  onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
                  className="w-full accent-accent-blue"
                  aria-label="Detection threshold"
                />
                <p className="text-xs text-gray-500 mt-1">Reduce ghost detections in low-light.</p>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">NMS Overlap: {nmsOverlap}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={nmsOverlap}
                  onChange={(e) => setNmsOverlap(parseFloat(e.target.value))}
                  className="w-full accent-accent-blue"
                  aria-label="NMS overlap"
                />
              </div>
              <Button className="w-full" size="sm">APPLY CHANGES</Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="PROCESSING UNIT" />
            <CardBody>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-gray-500">FPS</p>
                  <p className="text-lg font-semibold text-white">60.2</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lat</p>
                  <p className="text-lg font-semibold text-white">14ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="text-lg font-semibold text-white">42°C</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
