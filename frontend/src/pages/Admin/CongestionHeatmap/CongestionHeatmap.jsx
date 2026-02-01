import { useState, useEffect } from 'react';
import { analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const DAYS = ['OCT 23', 'OCT 24', 'OCT 25'];
const HOURS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];

export default function CongestionHeatmap() {
  const [data, setData] = useState([]);
  const [view, setView] = useState('heatmap');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [layers, setLayers] = useState({ staff: true, shock: true, zone: true });

  useEffect(() => {
    analytics.heatmap({ days: 7 }).then(setData).catch(() => setData([]));
  }, []);

  const getIntensity = (dayIdx, hourIdx) => {
    if (data.length) {
      const cell = data.find((c) => c.dayKey && c.timeSlot);
      return cell?.severity ?? 0;
    }
    return Math.random() * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Congestion Heatmap Analysis</h1>
        <div className="flex items-center gap-2">
          <input type="search" placeholder="Quick search..." className="px-3 py-2 rounded-lg bg-charcoal border border-slate text-white placeholder-gray-500 text-sm w-48" aria-label="Search" />
          <nav className="flex gap-2" aria-label="Main">
            <a href="/admin" className="px-3 py-2 text-sm text-gray-400 hover:text-white">Dashboard</a>
            <button type="button" className="px-3 py-2 text-sm font-medium text-accent-cyan border-b-2 border-accent-cyan">Heatmap</button>
            <a href="#" className="px-3 py-2 text-sm text-gray-400 hover:text-white">Interventions</a>
            <a href="#" className="px-3 py-2 text-sm text-gray-400 hover:text-white">Reports</a>
          </nav>
          <Button size="sm">Export Intelligence</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="space-y-4">
          <Card>
            <CardHeader title="SYSTEM CORE" />
            <CardBody className="space-y-2">
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-blue/20 text-accent-cyan text-sm font-medium">Flow Overview</button>
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white text-sm">Live Stream</button>
              <button type="button" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white text-sm">Incident Log</button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="ANALYSIS LAYERS" />
            <CardBody className="space-y-2">
              {[
                { id: 'staff', label: 'Staff Markers' },
                { id: 'shock', label: 'Shock Events' },
                { id: 'zone', label: 'Zone Alpha' },
              ].map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={layers[l.id]} onChange={(e) => setLayers((s) => ({ ...s, [l.id]: e.target.checked }))} className="rounded accent-accent-blue" />
                  {l.label}
                </label>
              ))}
            </CardBody>
          </Card>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="flex-1 h-2 rounded-full bg-slate overflow-hidden">
              <div className="h-full w-3/4 bg-status-green rounded-full" />
            </div>
            <span className="text-status-green">Stable</span>
          </div>
        </aside>
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader
              title="Congestion Heatmap Analysis"
              subtitle="Historical institutional flow and shock event detection for Zone Alpha."
            />
            <CardBody>
              <div className="flex flex-wrap gap-2 mb-4">
                <button type="button" onClick={() => setView('heatmap')} className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'heatmap' ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400'}`}>Heatmap View</button>
                <button type="button" onClick={() => setView('trend')} className={`px-3 py-1.5 rounded text-sm font-medium ${view === 'trend' ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400'}`}>Trend View</button>
                <button type="button" className="px-3 py-1.5 rounded text-sm text-gray-400 border border-slate flex items-center gap-1">
                  <span aria-hidden="true">📅</span> {dateRange}
                </button>
              </div>
              <div className="overflow-x-auto">
                <div className="inline-grid gap-0.5 min-w-[600px]" style={{ gridTemplateColumns: `60px repeat(${HOURS.length}, 1fr)`, gridTemplateRows: `repeat(${DAYS.length + 1}, 28px)` }}>
                  <div className="col-start-1 row-start-1" />
                  {HOURS.map((h, hi) => (
                    <div key={h} className="col-start-2 row-start-1 text-center text-xs text-gray-500 px-1 flex items-center justify-center" style={{ gridColumn: hi + 2 }}>{h}</div>
                  ))}
                  {DAYS.map((day, di) => (
                    <div key={day} className="contents">
                      <div className="text-xs text-gray-500 flex items-center pr-2" style={{ gridRow: di + 2, gridColumn: 1 }}>{day}</div>
                      {HOURS.map((_, hi) => {
                        const intensity = getIntensity(di, hi);
                        const isMarker = layers.shock && di === 1 && hi === 2;
                        const isStaff = layers.staff && di === 1 && (hi === 3 || hi === 5);
                        return (
                          <div
                            key={`${day}-${hi}`}
                            className="relative rounded-sm border border-slate/30 flex items-center justify-center"
                            style={{ backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`, gridRow: di + 2, gridColumn: hi + 2 }}
                            title={`${day} ${HOURS[hi]} — ${Math.round(intensity)}%`}
                          >
                            {isMarker && <span className="text-status-red text-xs" title="Shock Event">!</span>}
                            {isStaff && <span className="text-accent-cyan text-xs" title="Staff Deployment">👤</span>}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">INTENSITY:</span>
                  <div className="flex gap-0.5">
                    {[0, 25, 50, 75, 100].map((v) => (
                      <div key={v} className="w-6 h-3 rounded" style={{ backgroundColor: `rgba(59, 130, 246, ${v / 100})` }} title={`${v}%`} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Shock Event</span>
                  <span>Staff Deployment</span>
                  <span>Zone Rerouting</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Insight Panel" />
          <CardBody className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">RECURRING PEAK WINDOW</p>
              <p className="font-semibold text-white mt-1">09:15 - 10:45</p>
              <p className="text-sm text-gray-400 mt-0.5">Systematic congestion identified every Mon/Wed. Trigger: Main entrance batch intake.</p>
              <p className="text-xs text-accent-cyan mt-1">88% CONFIDENCE</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">RECOVERY SPEED</p>
              <p className="font-semibold text-white mt-1">Stabilization 12.4 min</p>
              <p className="text-sm text-gray-400 mt-0.5">T-minus stabilization time after shock events.</p>
              <div className="mt-2 h-4 flex gap-1">
                {[40, 60, 80, 70, 90].map((v, i) => (
                  <div key={i} className="flex-1 bg-accent-blue/60 rounded" style={{ height: `${v}%` }} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">TOP INTERVENTION</p>
              <p className="font-semibold text-white mt-1">Dynamic Rerouting</p>
              <p className="text-sm text-gray-400 mt-0.5">Dissipates 40% more flow than direct staff intervention.</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="ANOMALY LOG" />
          <CardBody className="space-y-2">
            {[
              { icon: '✕', label: 'Shock Event #204', time: 'Oct 24, 07:45', variant: 'danger' },
              { icon: '!', label: 'High Density Alert', time: 'Oct 25, 14:12', variant: 'warning' },
            ].map((e, i) => (
              <button key={i} type="button" className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-charcoal/50 text-left">
                <span className={`flex items-center gap-2 text-${e.variant === 'danger' ? 'status-red' : 'status-amber'}`}>{e.icon}</span>
                <span className="text-sm text-white">{e.label}</span>
                <span className="text-xs text-gray-500">{e.time}</span>
                <span className="text-gray-500" aria-hidden="true">›</span>
              </button>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
