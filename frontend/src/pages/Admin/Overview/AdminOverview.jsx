import { useState, useEffect } from 'react';
import { analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

export default function AdminOverview() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analytics.dailySummary({ limit: 20 }).then(setSummary).catch(() => setSummary([])).finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label: 'Average Wait Time', value: '4.2 mins', trend: '-12%', trendUp: false, bar: 70 },
    { label: 'Peak Congestion Hour', value: '14:00 - 15:30', trend: '+5%', trendUp: true, sub: 'Zone: North Entrance Lobby' },
    { label: 'Fairness Incidents', value: '2', trend: '-50%', trendUp: false, sub: 'Anomalies detected by Flow-AI' },
    { label: 'Sustainability Score', value: '94%', trend: '+2%', trendUp: true, bar: 94 },
  ];

  const eventIcon = (type) => {
    if (type === 'resolved' || type === 'shock_resolved') return '✓';
    if (type === 'optimization') return '⚙';
    if (type === 'warning') return '⚠';
    if (type === 'surge' || type === 'shock') return '👤';
    return '🕐';
  };
  const eventVariant = (type) => {
    if (type === 'resolved' || type === 'shock_resolved') return 'success';
    if (type === 'warning') return 'warning';
    if (type === 'shock') return 'danger';
    return 'info';
  };

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
          <span className="text-sm text-gray-500">System Time: {new Date().toLocaleTimeString('en-GB')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
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
                  <p className="text-xs text-gray-400 mt-1">Primary and redundant push protocols verified at 15:00 GMT.</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="mt-6">
            <CardHeader title="Temporal Flow Analysis" action={<div className="flex gap-2"><button type="button" className="text-xs text-gray-400">Today</button><button type="button" className="text-xs text-accent-cyan font-medium">7 Days</button><button type="button" className="text-xs text-gray-400">30 Days</button></div>} />
            <CardBody>
              <div className="h-48 flex items-end gap-1">
                {['MON 18', 'TUE 19', 'WED', 'THU 21', 'FRI 22', 'SAT 23', 'SUN 24', 'TODAY'].map((label, i) => (
                  <div key={label} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-accent-blue/60 rounded-t" style={{ height: `${40 + Math.random() * 50}%` }} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader title="Daily Summary Feed" action={<a href="#" className="text-sm text-accent-blue hover:underline">View History</a>} />
            <CardBody className="max-h-96 overflow-y-auto space-y-3">
              {loading ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : summary.length === 0 ? (
                <>
                  {[
                    { type: 'resolved', time: '14:22', title: 'Shock Event Resolved: Gate 12', msg: 'Congestion spike cleared via Dynamic Re-routing Alpha.' },
                    { type: 'optimization', time: '12:05', title: 'Flow Pattern Alpha Applied', msg: 'Intelligence engine re-balanced loads for anticipated peak.' },
                    { type: 'warning', time: '09:15', title: 'Sensor Node 421 Down', msg: 'Redundant node 422 tracking. Maintenance scheduled.' },
                    { type: 'surge', time: '08:42', title: 'Major Surge: Terminal B North', msg: '450+ arrivals in 10-min window. Capacity at 85%.' },
                    { type: 'scheduled', time: '06:00', title: 'Scheduled Maintenance', msg: 'System check completed.' },
                  ].map((e, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-charcoal/50">
                      <span className={`text-${e.type === 'resolved' ? 'status-green' : e.type === 'warning' ? 'status-amber' : e.type === 'surge' ? 'accent-blue' : 'gray-500'}`} aria-hidden="true">{eventIcon(e.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{e.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{e.msg}</p>
                        <p className="text-xs text-gray-500 mt-1">{e.time}</p>
                      </div>
                    </div>
                  ))}
                </>
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
