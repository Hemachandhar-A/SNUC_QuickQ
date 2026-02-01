import { useState, useEffect, useRef } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

export default function QueueMonitor() {
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const detection = useRealtimeStore((s) => s.detection);
  const [detectionThreshold, setDetectionThreshold] = useState(0.85);
  const [nmsOverlap, setNmsOverlap] = useState(0.45);
  const [events, setEvents] = useState([
    { time: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8), msg: 'System heartbeat: 100% operational', type: 'success' },
    { time: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8), msg: 'Zone A occupancy cleared', type: 'info' },
  ]);
  const [zones, setZones] = useState([
    { id: 'A', label: 'Zone A: Entry Hall', count: 8 },
    { id: 'B', label: 'Zone B: Counter', count: 12, warning: true },
    { id: 'C', label: 'Zone C: Exit Path', count: 4 },
  ]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const noVideo = detection?.noVideo === true;
  const count = noVideo ? 0 : (detection?.count ?? queueCount ?? 0);
  const confidence = noVideo ? 0 : (detection?.confidence != null ? Math.round((detection.confidence ?? 0) * 1000) / 10 : 98.4);
  const fps = detection?.fps ?? 0;
  const latencyMs = detection?.latencyMs ?? 0;
  const tempC = detection?.tempC ?? 0;
  const boxes = noVideo ? [] : (detection?.boxes ?? []);
  const frameJpeg = detection?.frameJpeg ?? null;
  const detectionMessage = detection?.message || 'Add a video file (e.g. sample.mp4) to backend/python/ for real person detection.';

  useEffect(() => {
    if (detection?.noVideo || detection?.count == null) return;
    const t = new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 8);
    setEvents((prev) => [
      { time: t, msg: `Detection: ${detection.count} persons (${detection.source ?? 'live'})`, type: 'info' },
      ...prev.slice(0, 14),
    ]);
  }, [detection?.noVideo, detection?.count, detection?.source]);

  useEffect(() => {
    if (detection?.noVideo) {
      setZones([
        { id: 'A', label: 'Zone A: Entry Hall', count: 0 },
        { id: 'B', label: 'Zone B: Counter', count: 0 },
        { id: 'C', label: 'Zone C: Exit Path', count: 0 },
      ]);
      return;
    }
    if (!detection?.boxes?.length && detection?.count == null) return;
    const total = detection.count ?? 0;
    const a = Math.floor(total * 0.35);
    const b = Math.floor(total * 0.45);
    const c = total - a - b;
    setZones([
      { id: 'A', label: 'Zone A: Entry Hall', count: a },
      { id: 'B', label: 'Zone B: Counter', count: b, warning: b > 10 },
      { id: 'C', label: 'Zone C: Exit Path', count: Math.max(0, c) },
    ]);
  }, [detection?.noVideo, detection?.count, detection?.boxes?.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    if (boxes.length > 0) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
      ctx.lineWidth = 2;
      ctx.font = '10px system-ui';
      boxes.forEach((box) => {
        const x = (box.x ?? 0) * w;
        const y = (box.y ?? 0) * h;
        const bw = Math.max(4, (box.w ?? 0.1) * w);
        const bh = Math.max(4, (box.h ?? 0.2) * h);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
        ctx.fillRect(x, y, bw, bh);
        ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)';
        ctx.strokeRect(x, y, bw, bh);
        ctx.fillStyle = '#22d3ee';
        const conf = (box.confidence ?? 0.9) * 100;
        ctx.fillText(`${conf.toFixed(0)}%`, x, Math.max(10, y - 2));
      });
    }
  }, [boxes, detection?.timestamp, containerSize]);

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
                <p className="text-4xl font-bold text-white tabular-nums mt-1">{count}</p>
                <p className="text-sm text-status-green mt-1">Live count</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="text-xs text-gray-500 uppercase">Confidence</p>
                <p className="text-4xl font-bold text-white tabular-nums mt-1">{confidence}%</p>
                <div className="mt-2 h-2 rounded-full bg-slate overflow-hidden">
                  <div className="h-full bg-accent-blue rounded-full" style={{ width: `${Math.min(100, confidence)}%` }} />
                </div>
              </CardBody>
            </Card>
          </div>
          <Card>
            <CardBody className="p-0">
              <div
                ref={containerRef}
                className="aspect-video bg-charcoal rounded-xl flex items-center justify-center relative overflow-hidden border border-slate/50"
              >
                {frameJpeg ? (
                  <img
                    src={`data:image/jpeg;base64,${frameJpeg}`}
                    alt="Live queue feed with person detection"
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-slate/50 to-transparent pointer-events-none" />
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      aria-hidden
                    />
                    {noVideo ? (
                      <div className="relative z-10 text-center px-6 max-w-md">
                        <p className="text-status-amber font-medium text-sm mb-2">No video source</p>
                        <p className="text-gray-400 text-xs">{detectionMessage}</p>
                        <p className="text-gray-500 text-xs mt-2">Place a .mp4 (or .avi/.mov) in backend/python/ and restart the backend for real YOLO person detection.</p>
                      </div>
                    ) : boxes.length === 0 ? (
                      <div className="relative text-gray-500 text-sm">Live feed — waiting for detection…</div>
                    ) : null}
                  </>
                )}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none">
                  {zones.map((z) => (
                    <span key={z.id} className="px-2 py-1 rounded bg-charcoal/80 border border-accent-blue/50 text-accent-cyan text-xs">
                      ZONE {z.id}
                    </span>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex gap-2 pointer-events-none">
                  <span className="px-2 py-1 rounded bg-accent-blue/20 text-accent-cyan text-xs">{count} persons</span>
                  <span className={`px-2 py-1 rounded border text-xs ${noVideo ? 'border-status-amber/50 text-status-amber' : 'border-dashed border-accent-blue text-accent-cyan'}`}>
                    {noVideo ? 'No video' : (detection?.source ?? 'live')}
                  </span>
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
                  <p className="text-lg font-semibold text-white tabular-nums">{typeof fps === 'number' ? fps.toFixed(1) : fps}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lat</p>
                  <p className="text-lg font-semibold text-white tabular-nums">{typeof latencyMs === 'number' ? Math.round(latencyMs) : latencyMs}ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Temp</p>
                  <p className="text-lg font-semibold text-white tabular-nums">{typeof tempC === 'number' ? Math.round(tempC) : tempC}°C</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {noVideo ? 'Add video for live pipeline' : 'Live from detection pipeline'}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
