import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { simulateSustainability } from '../../../services/sustainabilitySim';

export default function SustainabilityAnalytics() {
  const [metrics, setMetrics] = useState(null);
  const [trend, setTrend] = useState([]);
  const [range, setRange] = useState('Live');

  // Fake upstream system state
  const [systemState] = useState({
    queueSize: 120,
    congestion: 'MEDIUM',
    sensorConfidence: 0.92
  });

  useEffect(() => {
    const tick = () => {
      const snapshot = simulateSustainability(systemState);
      setMetrics(snapshot);
      setTrend((prev) => [...prev.slice(-6), snapshot]);
    };

    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, [systemState]);

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sustainability Intelligence</h1>
          <p className="text-gray-400 mt-1">
            Camera-driven plate return analytics — small mess throughput model
          </p>
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded-lg border border-slate text-sm text-gray-400"
        >
          {range}
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Daily Waste</p>
            <p className="text-3xl font-bold text-white mt-1">
              {metrics.dailyWasteKg} kg
            </p>
            <span className="text-sm text-status-red mt-1">
              {metrics.wasteKgPerMin} kg/min
            </span>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Completion Ratio</p>
            <p className="text-3xl font-bold text-white mt-1">
              {metrics.completionRatio}%
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
              {metrics.carbonSavedKg} kg CO₂
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
              {metrics.waterSavedL} L
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Irrigation equivalent
            </p>
          </CardBody>
        </Card>
      </div>

      {/* TREND + DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Waste Trend (Last 30 mins)"
            subtitle="Plates returned vs. congestion load"
          />
          <CardBody>
            <div className="h-48 flex items-end gap-2">
              {trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      t.congestion === 'HIGH'
                        ? 'bg-status-red/70'
                        : t.congestion === 'LOW'
                        ? 'bg-status-green/70'
                        : 'bg-accent-blue/70'
                    }`}
                    style={{ height: `${t.wasteRatio}%` }}
                  />
                  <span className="text-xs text-gray-500">
                    {new Date(t.timestamp).toLocaleTimeString([], {
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Live Distribution" />
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
                  strokeDasharray={`${metrics.completionRatio * 2.5} 250`}
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--status-red)"
                  strokeWidth="12"
                  strokeDasharray={`${metrics.wasteRatio * 2.5} 250`}
                  strokeDashoffset={`-${metrics.completionRatio * 2.5}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {metrics.completionRatio}%
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
      </div>

      {/* INTELLIGENCE LAYER */}
      <Card>
        <CardHeader title="System Intelligence Feed" />
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-charcoal/50">
            <div>
              <p className="font-medium text-white text-sm">
                Plate Throughput
              </p>
              <p className="text-xs text-gray-400">
                {metrics.plateRate} plates/min — Sensor confidence{' '}
                {(metrics.sensorConfidence * 100).toFixed(0)}%
              </p>
            </div>
            <Badge variant="success">LIVE</Badge>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-charcoal/50">
            <div>
              <p className="font-medium text-white text-sm">
                Congestion Impact
              </p>
              <p className="text-xs text-gray-400">
                {metrics.congestion === 'HIGH'
                  ? 'Rush window causing elevated waste'
                  : 'Stable flow — normal waste levels'}
              </p>
            </div>
            <Badge
              variant={
                metrics.congestion === 'HIGH'
                  ? 'danger'
                  : metrics.congestion === 'LOW'
                  ? 'success'
                  : 'warning'
              }
            >
              {metrics.congestion}
            </Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
