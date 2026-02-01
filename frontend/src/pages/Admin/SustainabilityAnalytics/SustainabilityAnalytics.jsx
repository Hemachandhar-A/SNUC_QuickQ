import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { analytics } from '../../../api/client';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { simulateSustainability } from '../../../services/SustainabilitySim';

function LineChart({ data, valueKey, label, color }) {
  if (!data || data.length < 1) return null;
  const sorted = [...data].sort((a, b) => (a.timestamp || a.id || 0) - (b.timestamp || b.id || 0));
  const values = sorted.map((d) => Number(d[valueKey]) || 0);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const w = 600;
  const h = 180;
  const pad = { left: 40, right: 16, top: 8, bottom: 24 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const xScale = (i) => pad.left + (sorted.length === 1 ? 0 : (i / (sorted.length - 1)) * innerW);
  const yScale = (v) => pad.top + (1 - (v - minV) / range) * innerH;
  const points = sorted.map((d, i) => `${xScale(i)},${yScale(Number(d[valueKey]) || 0)}`).join(' ');
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase">{label}</p>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="min-h-[180px]" preserveAspectRatio="xMidYMid meet">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

export default function SustainabilityAnalytics() {
  const liveSustainability = useRealtimeStore((s) => s.sustainability);
  const [log, setLog] = useState([]);
  const [range, setRange] = useState('Live');

  useEffect(() => {
    const fetchLog = () => {
      analytics.sustainability({ limit: 200 }).then(setLog).catch(() => setLog([]));
    };
    fetchLog();
    const interval = setInterval(fetchLog, 10000);
    return () => clearInterval(interval);
  }, []);

  const metrics = liveSustainability && (liveSustainability.dailyWasteKg != null || liveSustainability.sustainabilityScore != null)
    ? liveSustainability
    : log[0] || null;

  const fallbackMetrics = useMemo(() => {
    if (metrics) return null;
    return simulateSustainability({
      queueSize: 80,
      congestion: 'MEDIUM',
      sensorConfidence: 0.92,
    });
  }, [metrics]);

  const displayMetrics = metrics || fallbackMetrics;

  const trendData = useMemo(() => {
    if (log.length >= 2) return log;
    if (log.length === 1 && liveSustainability) return [liveSustainability, ...log];
    const seed = [];
    let base = simulateSustainability({ queueSize: 60, congestion: 'LOW', sensorConfidence: 0.9 });
    for (let i = 0; i < 12; i++) {
      const t = Date.now() - (11 - i) * 60000 * 5;
      const next = simulateSustainability({
        queueSize: base.queueSize + (Math.random() - 0.5) * 20,
        congestion: base.congestion,
        sensorConfidence: base.sensorConfidence,
      });
      next.timestamp = t;
      next.timestampISO = new Date(t).toISOString();
      seed.push(next);
      base = next;
    }
    return seed;
  }, [log, liveSustainability]);

  if (!displayMetrics) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sustainability Intelligence</h1>
          <p className="text-gray-400 mt-1">
            Camera-driven plate return analytics — closed-loop simulation (real trend lines)
          </p>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-lg border border-slate text-sm text-gray-400"
        >
          {range}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Daily Waste</p>
            <p className="text-3xl font-bold text-white mt-1">
              {(displayMetrics.dailyWasteKg ?? 0).toFixed(1)} kg
            </p>
            <span className="text-sm text-status-red mt-1">
              {(displayMetrics.wasteKgPerMin ?? 0)} kg/min
            </span>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Completion Ratio</p>
            <p className="text-3xl font-bold text-white mt-1">
              {displayMetrics.completionRatio ?? displayMetrics.sustainabilityScore ?? 0}%
            </p>
            <span className="text-sm text-status-green mt-1">
              Live sensor feed
            </span>
          </CardBody>
        </Card>

        <Card className="border-status-green/30">
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Carbon Offset</p>
            <p className="text-3xl font-bold text-white mt-1">
              {displayMetrics.carbonSavedKg ?? 0} kg CO₂
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Estimated impact (food lifecycle model)
            </p>
          </CardBody>
        </Card>

        <Card className="border-accent-cyan/30">
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Water Saved</p>
            <p className="text-3xl font-bold text-white mt-1">
              {displayMetrics.waterSavedL ?? 0} L
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Irrigation equivalent
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Real trend lines (from simulation log) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Waste trend (simulation)"
            subtitle="Daily waste kg over time — from closed-loop backend simulation"
          />
          <CardBody>
            <LineChart
              data={trendData}
              valueKey="dailyWasteKg"
              label="Daily waste (kg)"
              color="var(--status-red)"
            />
            {trendData.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {trendData.length} samples · last 30 min window
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Completion ratio trend"
            subtitle="Plate completion % over time"
          />
          <CardBody>
            <LineChart
              data={trendData}
              valueKey="completionRatio"
              label="Completion %"
              color="var(--status-green)"
            />
            {trendData.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {trendData.length} samples
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Live distribution ring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Live distribution" />
          <CardBody className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--status-green)"
                  strokeWidth="12"
                  strokeDasharray={`${(displayMetrics.completionRatio ?? displayMetrics.sustainabilityScore ?? 80) * 2.5} 250`}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--status-red)"
                  strokeWidth="12"
                  strokeDasharray={`${(displayMetrics.wasteRatio ?? (100 - (displayMetrics.sustainabilityScore ?? 80))) * 2.5} 250`}
                  strokeDashoffset={`-${(displayMetrics.completionRatio ?? displayMetrics.sustainabilityScore ?? 80) * 2.5}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {displayMetrics.completionRatio ?? displayMetrics.sustainabilityScore ?? 80}%
                </span>
                <span className="text-xs text-gray-400">COMPLETED</span>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-status-green" />
                Consumed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-status-red/60" />
                Waste
              </span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="System Intelligence Feed" />
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-charcoal/50">
              <div>
                <p className="font-medium text-white text-sm">Plate Throughput</p>
                <p className="text-xs text-gray-400">
                  {(displayMetrics.plateRate ?? 0)} plates/min — Sensor confidence{' '}
                  {((displayMetrics.sensorConfidence ?? 0.9) * 100).toFixed(0)}%
                </p>
              </div>
              <Badge variant="success">LIVE</Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-charcoal/50">
              <div>
                <p className="font-medium text-white text-sm">Congestion Impact</p>
                <p className="text-xs text-gray-400">
                  {(displayMetrics.congestion || '').toUpperCase() === 'HIGH'
                    ? 'Rush window causing elevated waste'
                    : 'Stable flow — normal waste levels'}
                </p>
              </div>
              <Badge
                variant={
                  (displayMetrics.congestion || '').toUpperCase() === 'HIGH'
                    ? 'danger'
                    : (displayMetrics.congestion || '').toUpperCase() === 'LOW'
                    ? 'success'
                    : 'warning'
                }
              >
                {(displayMetrics.congestion || 'MEDIUM').toUpperCase()}
              </Badge>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
