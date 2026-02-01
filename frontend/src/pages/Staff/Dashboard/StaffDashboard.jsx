import { useState } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function StaffDashboard() {
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const waitMinutes = useRealtimeStore((s) => s.waitMinutes);
  const congestionLevel = useRealtimeStore((s) => s.congestionLevel);
  const [incidentCount] = useState(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">POWER PANEL</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">LIVE QUEUE</p>
            <p className="text-2xl font-bold text-status-green tabular-nums">{queueCount || 142}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">EST. WAIT</p>
            <p className="text-xl font-semibold text-white tabular-nums">{waitMinutes || 12}m</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate flex items-center justify-center text-sm" aria-hidden="true">👤</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Current Flow</p>
            <p className="text-3xl font-bold text-white mt-1">2.4K/hr</p>
            <p className="text-sm text-status-green mt-1">+5%</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Active Staff</p>
            <p className="text-3xl font-bold text-white mt-1">48</p>
            <span className="inline-flex items-center gap-1 mt-1 text-sm text-status-green"><span className="w-2 h-2 rounded-full bg-status-green" /> Active</span>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Incident Alerts</p>
            <p className="text-3xl font-bold text-status-amber mt-1">{incidentCount}</p>
            <p className="text-sm text-gray-400 mt-1">Active</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Real-time Congestion Trend"
              subtitle="Visualizing flow intensity across all active sectors (Last 30m)"
            />
            <CardBody>
              <div className="flex justify-end gap-4 text-xs mb-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" /> Entry Flow</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-amber" /> Predicted</span>
              </div>
              <div className="h-56 flex items-end gap-0.5">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-status-green/60 rounded-t min-w-0 transition-all duration-300"
                    style={{ height: `${40 + Math.sin(i / 5) * 30 + Math.random() * 20}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>14:00</span>
                <span>LIVE</span>
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader title="AI OPERATIONS FEED" />
            <CardBody className="space-y-3">
              {[
                { icon: '⚠', title: 'Predictive Rush: Sector B', time: '2m ago', msg: 'Flow increase of 25% expected in 10 mins. Staffing at capacity.', action: 'EXECUTE ACTION' },
                { icon: '✓', title: 'Optimal Efficiency Reached', time: '8m ago', msg: 'Current entry rate is balanced with exit flow. No changes required.' },
                { icon: '✕', title: 'Mark Delay Resolved?', time: '15m ago', msg: 'Station 4 maintenance complete. Suggest re-enabling full access.', action: 'RESOLVE' },
              ].map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-charcoal border border-slate/30">
                  <div className="flex items-start gap-2">
                    <span className="text-status-amber" aria-hidden="true">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.msg}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                      {item.action && (
                        <Button size="sm" className="mt-2" variant={item.action === 'EXECUTE ACTION' ? 'primary' : 'secondary'}>
                          {item.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-charcoal/80 border border-slate/50">
        <div className="flex items-center gap-2">
          <Badge variant="success">STABLE</Badge>
          <span className="text-sm text-gray-400">Sector A Hub</span>
          <div className="w-24 h-1.5 rounded-full bg-slate overflow-hidden">
            <div className="h-full w-full bg-status-green rounded-full" />
          </div>
        </div>
        {['North Gate Active', 'Lobby A Active', 'Station 4 Caution', 'South Exit Active'].map((label, i) => (
          <span key={label} className="flex items-center gap-1.5 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${label.includes('Caution') ? 'bg-status-amber' : 'bg-status-green'}`} aria-hidden="true" />
            {label}
          </span>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 uppercase">Manual Controls</span>
          <Button variant="danger" size="sm">Send Alert</Button>
          <Button variant="secondary" size="sm">Disable Entry</Button>
          <Button variant="secondary" size="sm">Mark All Resolved</Button>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
          <span>Network: Ultra-Low Latency</span>
        </div>
      </div>
    </div>
  );
}
