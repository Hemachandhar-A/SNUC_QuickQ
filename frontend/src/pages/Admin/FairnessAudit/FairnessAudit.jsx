import { useState, useEffect } from 'react';
import { analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

const EVENT_TYPES = ['Priority Access', 'Staff Override', 'Re-entry Violation'];
const RISK_LEVELS = ['low', 'amber', 'red'];

export default function FairnessAudit() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState({ eventType: '', riskLevel: '' });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [anomalyOpen, setAnomalyOpen] = useState(false);
  const limit = 20;

  useEffect(() => {
    analytics.audit({ limit, offset: page * limit, ...filter }).then(setLogs).catch(() => setLogs([])).finally(() => setLoading(false));
  }, [page, filter]);

  useEffect(() => {
    analytics.auditStats().then(setStats).catch(() => setStats(null));
  }, []);

  const mockLogs = logs.length ? logs : [
    { id: '1', timestamp: '2023-10-27 14:22:01.442', eventType: 'Priority Access', userId: 'USR-****-8291', action: 'System Logged / Auto-Verified', riskLevel: 'low' },
    { id: '2', timestamp: '2023-10-27 14:18:33.120', eventType: 'Staff Override', userId: 'USR-****-4421', action: 'Manual Approval by OP-02', riskLevel: 'amber' },
    { id: '3', timestamp: '2023-10-27 14:15:02.891', eventType: 'Re-entry Violation', userId: 'USR-****-1203', action: 'Access Blocked / Turnstile Locked', riskLevel: 'red' },
    { id: '4', timestamp: '2023-10-27 14:10:45.221', eventType: 'Staff Override', userId: 'USR-****-5521', action: 'Supervisor Bypass Granted', riskLevel: 'amber' },
  ];

  const riskVariant = (r) => (r === 'red' ? 'danger' : r === 'amber' ? 'warning' : 'success');
  const eventVariant = (e) => (e === 'Re-entry Violation' ? 'danger' : e === 'Staff Override' ? 'warning' : 'info');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Fairness Audit Log</h1>
          <p className="text-gray-400 mt-1">Forensic governance and ethics monitoring for high-density human flow management.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="px-3 py-2 rounded-lg border border-slate text-sm text-gray-400 flex items-center gap-1">
            <span aria-hidden="true">📅</span> Oct 20, 2023 — Oct 27, 2023
          </button>
          <Button size="sm">Export Compliance Report</Button>
          <span className="w-8 h-8 rounded-full bg-slate flex items-center justify-center text-sm" aria-hidden="true">👤</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 uppercase">Policy Adherence</span>
              <span className="text-accent-blue" aria-hidden="true">🛡</span>
            </div>
            <p className="text-3xl font-bold text-white mt-2">98.4%</p>
            <span className="text-sm text-status-green mt-1">+0.2%</span>
            <div className="mt-2 h-1.5 rounded-full bg-slate overflow-hidden">
              <div className="h-full w-[98.4%] bg-accent-blue rounded-full" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 uppercase">Flagged Events (24H)</span>
              <span className="text-status-amber" aria-hidden="true">⚠</span>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{stats?.flagged24h ?? 12}</p>
            <p className="text-sm text-gray-400 mt-1">-5% vs avg</p>
            <p className="text-xs text-gray-500 mt-0.5">Requires immediate investigator review</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-gray-500 uppercase">Compliance Rate</span>
              <span className="text-accent-blue" aria-hidden="true">📊</span>
            </div>
            <p className="text-3xl font-bold text-white mt-2">99.1%</p>
            <span className="text-sm text-status-red mt-1">-0.1%</span>
            <p className="text-xs text-gray-500 mt-0.5">Aggregate institutional score</p>
          </CardBody>
        </Card>
        <Card className="border-status-amber/50">
          <CardBody className="flex flex-col">
            <div className="flex justify-between items-start">
              <span className="text-xs text-status-amber uppercase flex items-center gap-1">
                <span aria-hidden="true">◆</span> Abuse Alert
              </span>
            </div>
            <p className="font-semibold text-white mt-2">High-Frequency Overrides</p>
            <p className="text-sm text-gray-400 mt-1">Zone B-4 Gate identified 14 overrides by single staff ID in 2 hours.</p>
            <button type="button" className="text-accent-blue text-sm font-medium mt-2 hover:underline text-left">INVESTIGATE PATTERN</button>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button type="button" onClick={() => setFilter((f) => ({ ...f, eventType: '' }))} className={`px-3 py-1.5 rounded text-sm font-medium ${!filter.eventType ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400'}`}>All Events</button>
        {EVENT_TYPES.map((e) => (
          <button key={e} type="button" onClick={() => setFilter((f) => ({ ...f, eventType: e }))} className={`px-3 py-1.5 rounded text-sm font-medium ${filter.eventType === e ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400'}`}>{e}</button>
        ))}
        <select value={filter.riskLevel} onChange={(e) => setFilter((f) => ({ ...f, riskLevel: e.target.value }))} className="px-3 py-1.5 rounded bg-charcoal border border-slate text-white text-sm" aria-label="Risk level filter">
          <option value="">Violation Type</option>
          {RISK_LEVELS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 ml-auto">Showing {mockLogs.length} records</span>
        <button type="button" className="text-gray-500 hover:text-white" aria-label="Table options">⋮</button>
      </div>

      <Card className="relative">
        <CardBody className="p-0 overflow-x-auto">
          <table className="w-full text-sm" aria-label="Audit log table">
            <thead>
              <tr className="border-b border-slate/50">
                <th className="text-left py-3 px-4 text-gray-500 font-medium uppercase text-xs">Timestamp</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium uppercase text-xs">Event Type</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium uppercase text-xs">User ID (Masked)</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium uppercase text-xs">Action Taken</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium uppercase text-xs">Risk Level</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">Loading…</td></tr>
              ) : (
                mockLogs.map((row) => (
                  <tr key={row.id} className="border-b border-slate/30 hover:bg-charcoal/30">
                    <td className="py-3 px-4 text-gray-400 font-mono text-xs">{row.timestamp}</td>
                    <td className="py-3 px-4"><Badge variant={eventVariant(row.eventType)}>{row.eventType}</Badge></td>
                    <td className="py-3 px-4 text-gray-300 font-mono text-xs">{row.userId}</td>
                    <td className="py-3 px-4 text-gray-300">{row.action}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 text-xs ${row.riskLevel === 'red' ? 'text-status-red' : row.riskLevel === 'amber' ? 'text-status-amber' : 'text-status-green'}`}>
                        <span className="w-2 h-2 rounded-full bg-current" aria-hidden="true" />
                        {row.riskLevel === 'red' ? 'Critical' : row.riskLevel === 'amber' ? 'Amber / Warning' : 'Low'}
                      </span>
                    </td>
                    <td className="py-3 px-4"><button type="button" className="text-gray-500 hover:text-white" aria-label="View details">👁</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBody>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate/30">
          <span className="text-sm text-gray-500">Page 1 of 62</span>
        </div>
      </Card>

      {anomalyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="anomaly-title">
          <Card className="max-w-md w-full border-status-amber/50">
            <CardHeader title="Anomalous Activity" action={<button type="button" onClick={() => setAnomalyOpen(false)} className="text-gray-500 hover:text-white" aria-label="Close">✕</button>} />
            <CardBody className="space-y-4">
              <div className="p-3 rounded-lg bg-status-amber/10 border border-status-amber/30">
                <p className="text-xs text-status-amber uppercase font-medium">Pattern Detected</p>
                <p className="font-semibold text-white mt-1">Single Staff ID Override Loop — STF-4421</p>
                <Badge variant="warning" className="mt-2">12 Events</Badge>
              </div>
              <div className="p-3 rounded-lg bg-accent-blue/10 border border-accent-blue/30">
                <p className="text-xs text-accent-cyan uppercase font-medium">Geospatial Alert</p>
                <p className="font-semibold text-white mt-1">North Gate Density Peak — Zone 4-A</p>
                <p className="text-sm text-gray-400 mt-0.5">+42% avg</p>
              </div>
              <Button className="w-full" size="sm">View Live Monitoring</Button>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
