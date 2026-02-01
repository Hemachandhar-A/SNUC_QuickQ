import { useState, useEffect } from 'react';
import { ai } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const SCENARIOS = [
  { id: 'exam', label: 'Exam Day', desc: 'Sharp morning peaks.', icon: '🎓' },
  { id: 'weekend', label: 'Weekend', desc: 'Flatter curves.', icon: '🏠' },
  { id: 'weather', label: 'Weather Impact', desc: 'High indoor density.', icon: '🌧' },
];

export default function DemandForecast() {
  const [scenario, setScenario] = useState({ exam: true, weekend: false, weather: false });
  const [forecast, setForecast] = useState(null);
  const [confidence, setConfidence] = useState(92);
  const [range, setRange] = useState('24h');

  useEffect(() => {
    const s = scenario.exam ? 'exam' : scenario.weekend ? 'weekend' : scenario.weather ? 'weather' : 'normal';
    ai.forecastDemand({ scenario: s, horizonHours: range === '24h' ? 24 : range === '7d' ? 24 * 7 : 24 * 30 })
      .then((res) => {
        setForecast(res);
        setConfidence(res.confidence ? Math.round(res.confidence * 100) : 92);
      })
      .catch(() => setForecast(null));
  }, [scenario, range]);

  const points = forecast?.points || Array.from({ length: 12 }, (_, i) => ({ hour: 8 + i * 2, value: 200 + Math.sin(i / 2) * 100 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Demand Forecast AI</h1>
        <div className="flex items-center gap-2">
          <nav className="flex gap-2" aria-label="Tabs">
            <button type="button" className="px-3 py-1.5 rounded text-sm font-medium text-accent-cyan border-b-2 border-accent-cyan">Overview</button>
            <button type="button" className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white">Live Feed</button>
            <button type="button" className="px-3 py-1.5 rounded text-sm text-gray-400 hover:text-white">Reports</button>
          </nav>
          <input type="search" placeholder="Search parameters..." className="px-3 py-2 rounded-lg bg-charcoal border border-slate text-white placeholder-gray-500 text-sm w-48" aria-label="Search" />
          <Button size="sm">Force Refresh AI</Button>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Attendance Forecast"
          subtitle={
            <span className="flex items-center gap-2 text-sm text-status-green">
              <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" /> Last updated: 2 minutes ago. Predictive engine running on real-time sensor data.
            </span>
          }
        />
        <CardBody>
          <div className="flex flex-wrap gap-2 mb-4">
            {['Next 24h', '7 Days', '30 Days'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r === 'Next 24h' ? '24h' : r === '7 Days' ? '7d' : '30d')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${range === (r === 'Next 24h' ? '24h' : r === '7 Days' ? '7d' : '30d') ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400 hover:text-white'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="relative">
            <p className="text-sm text-gray-400 mb-2">Projected Occupancy — Hourly granularity across all institutional nodes.</p>
            <div className="flex gap-1 mb-2 text-xs">
              <label className="flex items-center gap-1 text-accent-blue"><input type="checkbox" defaultChecked /> FORECAST LINE</label>
              <label className="flex items-center gap-1 text-gray-400"><input type="checkbox" /> CONFIDENCE BAND (95%)</label>
            </div>
            <div className="h-64 flex items-end gap-0.5 relative">
              {/* Risk bands */}
              <div className="absolute inset-0 flex" aria-hidden="true">
                <div className="w-[25%] bg-status-amber/20 border-l border-r border-status-amber/40" title="Service delay likelihood" />
                <div className="flex-1" />
                <div className="w-[20%] bg-status-red/20 border-l border-r border-status-red/40" title="Overflow window" />
              </div>
              {points.slice(0, 12).map((p, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-0 bg-accent-blue/70 rounded-t relative z-10 transition-all duration-300"
                  style={{ height: `${Math.min(100, (p.value / 400) * 100)}%` }}
                  title={`${p.hour || 8 + i * 2}:00 — ${p.value}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>08:00</span>
              <span>20:00</span>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-4 h-2 rounded bg-status-amber/50" /> SERVICE DELAY LIKELIHOOD</span>
              <span className="flex items-center gap-1"><span className="w-4 h-2 rounded bg-status-red/50" /> OVERFLOW WINDOW</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SCENARIOS.map((s) => (
          <Card key={s.id}>
            <CardBody className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-2xl" aria-hidden="true">{s.icon}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={scenario[s.id]}
                  onClick={() => setScenario((prev) => ({ ...prev, [s.id]: !prev[s.id] }))}
                  className={`relative w-12 h-6 rounded-full transition ${scenario[s.id] ? 'bg-accent-blue' : 'bg-slate'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition left-1 ${scenario[s.id] ? 'translate-x-6' : ''}`} />
                </button>
              </div>
              <p className="font-semibold text-white mt-2">{s.label}</p>
              <p className="text-sm text-gray-400 mt-0.5">{s.desc}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Prediction Confidence" />
          <CardBody className="text-center">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-slate)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-blue)" strokeWidth="8" strokeDasharray={`${confidence * 2.64} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{confidence}%</span>
                <span className="text-xs text-status-green">+2.4% vs last hr</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">High-fidelity data stream confirmed via 42 sensor nodes.</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Projected Food Demand" />
          <CardBody className="space-y-3">
            <p className="text-sm text-white">Main Cafeteria: <strong>1,240 meals</strong></p>
            <p className="text-sm text-white">North Hub Kiosks: <strong>450 meals</strong></p>
            <p className="text-sm text-white">Staff Lounge: <strong>120 meals</strong></p>
            <Button size="sm" variant="secondary" className="w-full mt-2">Adjust Inventory Orders</Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Risk Thresholds" />
          <CardBody className="space-y-4">
            <div className="flex gap-3">
              <span className="w-1 h-8 rounded bg-status-red flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-white text-sm">Overflow Risk</p>
                <p className="text-xs text-gray-400">Occupancy &gt; 90% of local fire code limit.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-1 h-8 rounded bg-status-amber flex-shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-white text-sm">Service Delay</p>
                <p className="text-xs text-gray-400">Wait times likely to exceed 12 mins.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
