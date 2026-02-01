import { useState, useEffect, useMemo, Fragment } from 'react';
import { analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);

function formatDayLabel(dayKey) {
  const d = new Date(dayKey + 'T12:00:00');
  const short = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return short;
}

export default function CongestionHeatmap() {
  const [data, setData] = useState([]);
  const [view, setView] = useState('heatmap');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [layers, setLayers] = useState({ staff: true, shock: true, zone: true });
  const [days] = useState(7);

  useEffect(() => {
    const fetchHeatmap = () => {
      analytics.heatmap({ days }).then(setData).catch(() => setData([]));
    };
    fetchHeatmap();
    const interval = setInterval(fetchHeatmap, 10000);
    return () => clearInterval(interval);
  }, [days]);

  const { dayLabels, dayKeys, getIntensity, getEvents } = useMemo(() => {
    const keys = [];
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      keys.push(date.toISOString().slice(0, 10));
    }
    const dayLabels = keys.map(formatDayLabel);

    const getIntensity = (dayIdx, hourIdx) => {
      const idx = dayIdx * 24 + hourIdx;
      const cell = data[idx];
      return cell?.severity ?? 0;
    };

    const getEvents = (dayIdx, hourIdx) => {
      const idx = dayIdx * 24 + hourIdx;
      const cell = data[idx];
      return cell?.events ?? [];
    };

    return { dayLabels, dayKeys: keys, getIntensity, getEvents };
  }, [data, days]);

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
          <div className="flex gap-2 text-sm text-gray-400">
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
              subtitle="Live simulation: capacity % by day and hour (breakfast/lunch/dinner peaks). Refreshes every 10s."
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
                <div
                  className="inline-grid gap-0.5 min-w-[640px]"
                  style={{
                    gridTemplateColumns: '56px repeat(24, minmax(18px, 1fr))',
                    gridTemplateRows: `28px repeat(${dayLabels.length}, 26px)`,
                  }}
                >
                  <div className="col-start-1 row-start-1" />
                  {HOURS.map((hr, hi) => (
                    <div
                      key={hr}
                      className="text-center text-xs text-gray-500 flex items-center justify-center"
                      style={{ gridColumn: hi + 2, gridRow: 1 }}
                    >
                      {hi % 4 === 0 ? hr : ''}
                    </div>
                  ))}
                  {dayLabels.map((label, di) => (
                    <Fragment key={dayKeys[di]}>
                      <div className="text-xs text-gray-500 flex items-center pr-2" style={{ gridRow: di + 2, gridColumn: 1 }}>{label}</div>
                      {HOURS.map((_, hi) => {
                        const intensity = getIntensity(di, hi);
                        const events = getEvents(di, hi);
                        const hasShock = layers.shock && events.some((e) => e.type === 'shock' || e.severity === 'critical');
                        const hasStaff = layers.staff && events.some((e) => e.type === 'staff');
                        return (
                          <div
                            key={`${di}-${hi}`}
                            className="relative rounded-sm border border-slate/30 min-w-[18px] min-h-[22px] flex items-center justify-center"
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                              gridRow: di + 2,
                              gridColumn: hi + 2,
                            }}
                            title={`${label} ${HOURS[hi]} — ${intensity}% capacity`}
                          >
                            {hasShock && <span className="text-status-red text-xs font-bold" title="Shock Event">!</span>}
                            {!hasShock && hasStaff && <span className="text-accent-cyan text-xs" title="Staff">👤</span>}
                          </div>
                        );
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">INTENSITY (capacity %):</span>
                  <div className="flex gap-0.5">
                    {[0, 25, 50, 75, 100].map((v) => (
                      <div key={v} className="w-6 h-3 rounded" style={{ backgroundColor: `rgba(59, 130, 246, ${v / 100})` }} title={`${v}%`} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Shock Event</span>
                  <span>Staff Deployment</span>
                  <span>Zone Alpha</span>
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
              <p className="font-semibold text-white mt-1">07:00–09:00, 12:00–14:00, 19:00–21:00</p>
              <p className="text-sm text-gray-400 mt-0.5">Breakfast, lunch and dinner peaks from live simulation. Intensity = capacity %.</p>
              <p className="text-xs text-accent-cyan mt-1">LIVE SIMULATION</p>
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
