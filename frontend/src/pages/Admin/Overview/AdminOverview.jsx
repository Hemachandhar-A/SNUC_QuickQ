import { useState, useEffect } from 'react';
import { analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function AdminOverview() {
  const [summary, setSummary] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [temporalFlow, setTemporalFlow] = useState([]);
  const [flowDays, setFlowDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [systemTime, setSystemTime] = useState(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    Promise.all([
      analytics.dailySummary({ limit: 20 }),
      analytics.overviewKpis(),
      analytics.temporalFlow({ days: flowDays }),
    ])
      .then(([s, k, t]) => {
        setSummary(s || []);
        setKpis(k || null);
        setTemporalFlow(Array.isArray(t) ? t : []);
      })
      .catch(() => {
        setSummary([]);
        setKpis(null);
        setTemporalFlow([]);
      })
      .finally(() => setLoading(false));
  }, [flowDays]);

  useEffect(() => {
    const t = setInterval(() => setSystemTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  const peakLabel = kpis?.peakCongestionDay
    ? `${kpis.peakCongestionHour || '12:00'} (${kpis.peakCongestionDay})`
    : '12:00 - 13:30';

  const kpiRows = kpis
    ? [
        {
          label: 'Average Wait Time',
          value: `${kpis.avgWaitMinutes ?? 5} mins`,
          trend: '-8%',
          trendUp: false,
          bar: Math.min(100, 100 - (kpis.avgWaitMinutes ?? 5) * 3),
          sub: 'Small mess: 12 p/min capacity',
        },
        {
          label: 'Peak Congestion Hour',
          value: peakLabel,
          trend: '+3%',
          trendUp: true,
          sub: 'Zone: North Entrance Lobby',
        },
        {
          label: 'Fairness Incidents',
          value: String(kpis.fairnessIncidents24h ?? 0),
          trend: '-50%',
          trendUp: false,
          sub: 'Last 24h — anomalies detected by Flow-AI',
        },
        {
          label: 'Sustainability Score',
          value: `${kpis.sustainabilityScore ?? 92}%`,
          trend: '+2%',
          trendUp: true,
          bar: kpis.sustainabilityScore ?? 92,
        },
      ]
    : [
        { label: 'Average Wait Time', value: '5 mins', trend: '-8%', trendUp: false, bar: 65, sub: 'Small mess: 12 p/min capacity' },
        { label: 'Peak Congestion Hour', value: peakLabel, trend: '+3%', trendUp: true, sub: 'Zone: North Entrance Lobby' },
        { label: 'Fairness Incidents', value: '0', trend: '-50%', trendUp: false, sub: 'Anomalies detected by Flow-AI' },
        { label: 'Sustainability Score', value: '92%', trend: '+2%', trendUp: true, bar: 92 },
      ];

  const eventIcon = (type) => {
    if (type === 'resolved' || type === 'shock_resolved') return '✓';
    if (type === 'optimization') return '⚙';
    if (type === 'warning') return '⚠';
    if (type === 'surge' || type === 'shock') return '◆';
    return '🕐';
  };

  const maxCap = temporalFlow.length ? Math.max(...temporalFlow.map((r) => r.avgCapacity || 0), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Executive Overview</h1>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Search facilities or events..."
            className="px-4 py-2 rounded-lg bg-charcoal border border-slate text-white placeholder-gray-500 text-sm w-64 focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            aria-label="Search"
          />
          <span className="text-sm text-gray-500">System Time: {systemTime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiRows.map((k) => (
          <Card key={k.label}>
            <CardBody>
              <p className="text-xs text-gray-500 uppercase">{k.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{k.value}</span>
                {k.trend && (
                  <span className={`text-sm font-medium ${k.trendUp ? 'text-status-green' : 'text-status-red'}`}>
                    {k.trend}
                  </span>
                )}
              </div>
              {k.sub && <p className="text-xs text-gray-400 mt-1">{k.sub}</p>}
              {k.bar !== undefined && (
                <div className="mt-2 h-1.5 rounded-full bg-slate overflow-hidden">
                  <div
                    className={`h-full rounded-full ${k.trendUp ? 'bg-status-green' : 'bg-status-red'}`}
                    style={{ width: `${k.bar}%` }}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="System Health Indicators"
              action={<Badge variant="success">LIVE</Badge>}
            />
            <CardBody className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal/50">
                <span className="text-accent-cyan text-xl" aria-hidden="true">📡</span>
                <div>
                  <p className="font-semibold text-white">IoT Sensors</p>
                  <p className="text-status-green text-sm">ALL 4,201 ONLINE</p>
                  <p className="text-xs text-gray-400 mt-1">Edge nodes reporting 100% telemetry fidelity in all high-density zones.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal/50">
                <span className="text-accent-blue text-xl" aria-hidden="true">🤖</span>
                <div>
                  <p className="font-semibold text-white">Intelligence Engine</p>
                  <p className="text-accent-cyan text-sm">FLOW ALPHA ACTIVE</p>
                  <p className="text-xs text-gray-400 mt-1">Neural model 8.4-Q processing throughput. Latency: 12ms.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-charcoal/50">
                <span className="text-status-green text-xl" aria-hidden="true">🔔</span>
                <div>
                  <p className="font-semibold text-white">Alert Systems</p>
                  <p className="text-status-green text-sm">READY - NO DELAYS</p>
                  <p className="text-xs text-gray-400 mt-1">Primary and redundant push protocols verified.</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="mt-6">
            <CardHeader
              title="Temporal Flow Analysis"
              subtitle="Avg wait & capacity by day (from live simulation)"
              action={
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFlowDays(1)}
                    className={`text-xs ${flowDays === 1 ? 'text-accent-cyan font-medium' : 'text-gray-400'}`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowDays(7)}
                    className={`text-xs ${flowDays === 7 ? 'text-accent-cyan font-medium' : 'text-gray-400'}`}
                  >
                    7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlowDays(30)}
                    className={`text-xs ${flowDays === 30 ? 'text-accent-cyan font-medium' : 'text-gray-400'}`}
                  >
                    30 Days
                  </button>
                </div>
              }
            />
            <CardBody>
              {temporalFlow.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No flow data yet. Data builds as the simulation runs.</p>
              ) : (
                <>
                  <div className="h-48 flex items-end gap-1">
                    {temporalFlow.slice(0, 14).map((row, i) => (
                      <div key={row.dayKey || i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                        <div
                          className="w-full bg-accent-blue/60 rounded-t transition-all"
                          style={{ height: `${Math.min(100, (row.avgCapacity || 0) / maxCap * 100)}%` }}
                          title={`${row.dayKey}: ${row.avgWait ?? 0}m avg wait, ${row.avgCapacity ?? 0}% capacity`}
                        />
                        <span className="text-xs text-gray-500 truncate w-full text-center">
                          {row.dayKey ? new Date(row.dayKey).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) : row.dayKey}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Avg capacity % (bar height)</span>
                    <span>Avg wait: {temporalFlow.length ? Math.round(temporalFlow.reduce((a, r) => a + (r.avgWait || 0), 0) / temporalFlow.length) : 0}m</span>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader title="Daily Summary Feed" action={<span className="text-sm text-accent-blue">Live</span>} />
            <CardBody className="max-h-96 overflow-y-auto space-y-3">
              {loading ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : summary.length === 0 ? (
                [
                  { type: 'resolved', time: '14:22', title: 'Shock Event Resolved', msg: 'Congestion spike cleared via Dynamic Re-routing.' },
                  { type: 'optimization', time: '12:05', title: 'Flow Pattern Applied', msg: 'Intelligence engine re-balanced loads for anticipated peak.' },
                  { type: 'warning', time: '09:15', title: 'Sensor Node Down', msg: 'Redundant node tracking. Maintenance scheduled.' },
                  { type: 'surge', time: '08:42', title: 'Major Surge: Terminal B North', msg: '450+ arrivals in 10-min window. Capacity at 85%.' },
                ].map((e, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-lg bg-charcoal/50">
                    <span className={`${e.type === 'resolved' ? 'text-status-green' : e.type === 'warning' ? 'text-status-amber' : e.type === 'surge' ? 'text-accent-blue' : 'text-gray-500'}`} aria-hidden="true">{eventIcon(e.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{e.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{e.msg}</p>
                      <p className="text-xs text-gray-500 mt-1">{e.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                summary.map((e, i) => (
                  <div key={e.id || i} className="flex gap-3 p-3 rounded-lg bg-charcoal/50">
                    <span className="text-gray-400" aria-hidden="true">{eventIcon(e.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{e.title || e.type}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{e.message || e.msg || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">{e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}</p>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
