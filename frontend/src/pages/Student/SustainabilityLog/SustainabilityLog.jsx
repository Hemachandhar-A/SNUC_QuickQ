import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function SustainabilityLog() {
  const sustainability = useRealtimeStore((s) => s.sustainability);

  const score = sustainability?.sustainabilityScore ?? 82;
  const wasteTrend = sustainability?.wasteTrend ?? 'low';
  const mostEaten = sustainability?.mostEatenMeal ?? 'Chicken Biryani';
  const highWasteWindow = sustainability?.highWasteWindow;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sustainability Intelligence</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" aria-hidden="true" />
            LIVE SENSOR DATA
          </p>
        </div>
      </div>

      {highWasteWindow && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-charcoal border border-status-amber/30">
          <div className="flex items-center gap-3">
            <span className="text-status-amber text-xl" aria-hidden="true">⚠</span>
            <div>
              <p className="font-medium text-white">High Waste Window Detected</p>
              <p className="text-sm text-gray-400">
                {highWasteWindow.start} - {highWasteWindow.end} ({highWasteWindow.zone || 'Lunch Shift'}) threshold exceeded in Zone B Smart Plates.
              </p>
            </div>
          </div>
          <button type="button" className="px-4 py-2 rounded-lg bg-status-green/20 text-status-green text-sm font-medium hover:bg-status-green/30 transition">
            Analyze Zone
          </button>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-slate)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--accent-emerald)"
              strokeWidth="8"
              strokeDasharray={`${score * 2.64} 264`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">{score}</span>
            <span className="text-gray-400 text-sm">/ 100</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-white mt-4">Live Mess Sustainability Score</p>
        <p className="flex items-center gap-2 text-accent-blue text-sm mt-1">
          <span aria-hidden="true">✓</span>
          System Status: Optimized Efficiency
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 uppercase">Waste Trend</span>
              <span className="text-gray-500" aria-hidden="true">📈</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">{wasteTrend.toUpperCase()}</p>
            <p className="text-sm text-gray-400 mt-1">-12% from yesterday</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 uppercase">Most Eaten Meal</span>
              <span className="text-gray-500" aria-hidden="true">🍴</span>
            </div>
            <p className="text-xl font-bold text-white mt-2">{mostEaten}</p>
            <p className="text-sm text-accent-blue mt-1">94% Consumption Rate</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 uppercase">Active Occupancy</span>
              <span className="text-gray-500" aria-hidden="true">👥</span>
            </div>
            <p className="text-2xl font-bold text-white mt-2">142 Students</p>
            <p className="text-sm text-status-green mt-1">+5% vs typical lunch hours</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="AUTOMATED SMART PLATE PULSE" />
        <CardBody className="space-y-3">
          {[
            { zone: 'Zone A-04 Plate Returned', status: 'CLEAN', icon: '✓', variant: 'success', pct: 100 },
            { zone: 'Zone B-12 Plate Returned', status: 'PARTIAL', icon: 'i', variant: 'info', pct: 60 },
            { zone: 'Zone C Real-time Analysis Active', status: 'SCANNING', icon: '◌', variant: 'default', pct: 0 },
          ].map((row) => (
            <div key={row.zone} className="flex items-center gap-3">
              <span className={`text-${row.variant === 'success' ? 'status-green' : row.variant === 'info' ? 'accent-blue' : 'gray-500'}`} aria-hidden="true">{row.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{row.zone}</p>
                <div className="h-1.5 mt-1 rounded-full bg-slate overflow-hidden">
                  <div
                    className={`h-full rounded-full ${row.variant === 'success' ? 'bg-status-green' : row.variant === 'info' ? 'bg-accent-blue' : 'bg-gray-500'}`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
              <Badge variant={row.variant === 'success' ? 'success' : row.variant === 'info' ? 'info' : 'default'}>{row.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>

      <p className="text-center text-sm text-gray-500">
        &ldquo;Return plates clean to help reduce food waste and support our campus net-zero goal.&rdquo;
      </p>
      <p className="text-center text-xs text-gray-600">
        SYSTEM V4.2.0 • ENCRYPTION ACTIVE
      </p>
    </div>
  );
}
