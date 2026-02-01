import { useState, useMemo, useEffect } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { staff } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

const PROCESS_RATE = 12;
const FLOW_PER_HOUR = PROCESS_RATE * 60;
const ACTIVE_STAFF = 4;

function getCongestionColor(pct) {
  if (pct <= 33) return 'bg-status-green';
  if (pct <= 66) return 'bg-status-amber';
  return 'bg-status-red';
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function StaffDashboard() {
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const waitMinutes = useRealtimeStore((s) => s.waitMinutes);
  const queueHistory = useRealtimeStore((s) => s.queueHistory);
  const staffState = useRealtimeStore((s) => s.staffState);
  const systemStatus = useRealtimeStore((s) => s.systemStatus);

  const [aiFeedItems, setAiFeedItems] = useState([]);
  const [incidentCount, setIncidentCount] = useState(0);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [manualLoading, setManualLoading] = useState({});
  const [lastSync, setLastSync] = useState(new Date());

  const entryEnabled = staffState?.entry_enabled === true || staffState?.entry_enabled === '1';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingFeed(true);
      try {
        const [feedRes, countRes] = await Promise.all([
          staff.aiFeed({ limit: 20 }),
          staff.alertsCount(),
        ]);
        if (!cancelled && feedRes?.items) setAiFeedItems(feedRes.items);
        if (!cancelled && countRes?.count != null) setIncidentCount(countRes.count);
      } catch (_) {}
      if (!cancelled) setLoadingFeed(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const refreshFeed = async () => {
    try {
      const res = await staff.aiFeed({ limit: 20 });
      if (res?.items) setAiFeedItems(res.items);
      const countRes = await staff.alertsCount();
      if (countRes?.count != null) setIncidentCount(countRes.count);
      setLastSync(new Date());
    } catch (_) {}
  };

  const handleExecuteAction = async (item) => {
    const id = item.id;
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      if (item.action_type === 'resolve') {
        await staff.resolveAiFeedItem(id);
        setAiFeedItems((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: 1 } : i)));
      } else if (item.action_type === 'execute') {
        await staff.sendAlert({
          type: 'ai_recommendation',
          title: item.title,
          message: item.message,
          severity: 'warning',
        });
        await staff.resolveAiFeedItem(id);
        setAiFeedItems((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: 1 } : i)));
      }
      await refreshFeed();
    } catch (_) {}
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleResolve = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      await staff.resolveAiFeedItem(id);
      setAiFeedItems((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: 1 } : i)));
      await refreshFeed();
    } catch (_) {}
    setActionLoading((prev) => ({ ...prev, [id]: false }));
  };

  const handleSendAlert = async () => {
    setManualLoading((prev) => ({ ...prev, alert: true }));
    try {
      await staff.sendAlert({
        type: 'manual',
        title: 'Staff Alert',
        message: 'Please expect short delays. Thank you for your patience.',
        severity: 'warning',
      });
      await refreshFeed();
    } catch (_) {}
    setManualLoading((prev) => ({ ...prev, alert: false }));
  };

  const handleEntryToggle = async (enabled) => {
    setManualLoading((prev) => ({ ...prev, entry: true }));
    try {
      await staff.setEntry(enabled);
      await refreshFeed();
    } catch (_) {}
    setManualLoading((prev) => ({ ...prev, entry: false }));
  };

  const handleMarkAllResolved = async () => {
    setManualLoading((prev) => ({ ...prev, resolveAll: true }));
    try {
      await staff.resolveAllAiFeed();
      await refreshFeed();
    } catch (_) {}
    setManualLoading((prev) => ({ ...prev, resolveAll: false }));
  };

  const now = new Date();
  const trendValues = useMemo(() => {
    const hist = queueHistory.length ? queueHistory : Array.from({ length: 30 }, () => 25 + Math.random() * 40);
    return hist.length >= 30 ? hist : [...Array(30 - hist.length).fill(hist[0] ?? 30), ...hist];
  }, [queueHistory]);
  const timeLabels = useMemo(() => {
    const labels = [];
    for (let i = 0; i <= 6; i++) {
      const t = new Date(now.getTime() - (30 - (i / 6) * 30) * 60 * 1000);
      labels.push(t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }
    return labels;
  }, []);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">POWER PANEL</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">LIVE QUEUE</p>
            <p className="text-2xl font-bold text-status-green tabular-nums">{queueCount ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">EST. WAIT</p>
            <p className="text-xl font-semibold text-white tabular-nums">{waitMinutes ?? 0}m</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Current Flow</p>
            <p className="text-3xl font-bold text-white mt-1">{FLOW_PER_HOUR}/hr</p>
            <p className="text-sm text-gray-400 mt-1">Max {PROCESS_RATE} p/min</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Active Staff</p>
            <p className="text-3xl font-bold text-white mt-1">{ACTIVE_STAFF}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-sm text-status-green"><span className="w-2 h-2 rounded-full bg-status-green" /> Active</span>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Incident Alerts</p>
            <p className="text-3xl font-bold text-status-amber mt-1">{incidentCount}</p>
            <p className="text-sm text-gray-400 mt-1">Active (24h)</p>
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
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" /> Low</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-amber" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-red" /> High</span>
              </div>
              <div className="h-56 flex items-end gap-0.5">
                {trendValues.map((val, i) => {
                  const pct = Math.min(100, Number(val) ?? 0);
                  const colorClass = getCongestionColor(pct);
                  return (
                    <div
                      key={i}
                      className={`flex-1 ${colorClass} rounded-t min-w-0 transition-all duration-300 opacity-90`}
                      style={{ height: `${pct}%` }}
                      title={`${timeLabels[Math.floor((i / 30) * (timeLabels.length - 1))]} – ${Math.round(pct)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{timeLabels[0]}</span>
                <span>LIVE {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader title="AI OPERATIONS FEED" />
            <CardBody className="space-y-3">
              {loadingFeed ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : aiFeedItems.length === 0 ? (
                <p className="text-sm text-gray-500">No items</p>
              ) : (
                aiFeedItems.slice(0, 8).map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-charcoal border border-slate/30">
                    <div className="flex items-start gap-2">
                      <span className="text-status-amber" aria-hidden="true">
                        {item.action_type === 'resolve' ? '✕' : item.action_type === 'execute' ? '⚠' : '✓'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{timeAgo(item.created_at)}</p>
                        {item.resolved ? (
                          <span className="inline-block mt-2 text-xs text-status-green">Resolved</span>
                        ) : (item.action_type === 'execute' || item.action_type === 'resolve') && (
                          <Button
                            size="sm"
                            className="mt-2"
                            variant={item.action_type === 'execute' ? 'primary' : 'secondary'}
                            disabled={actionLoading[item.id]}
                            onClick={() => item.action_type === 'resolve' ? handleResolve(item.id) : handleExecuteAction(item)}
                          >
                            {item.action_type === 'execute' ? 'EXECUTE ACTION' : 'RESOLVE'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-charcoal/80 border border-slate/50">
        <div className="flex items-center gap-2">
          <Badge variant={entryEnabled && !systemStatus?.shockEvent ? 'success' : 'warning'}>
            {entryEnabled && !systemStatus?.shockEvent ? 'STABLE' : 'LIMITED'}
          </Badge>
          <span className="text-sm text-gray-400">Sector A Hub</span>
          <div className="w-24 h-1.5 rounded-full bg-slate overflow-hidden">
            <div className="h-full rounded-full bg-status-green" style={{ width: entryEnabled ? '100%' : '0%' }} />
          </div>
        </div>
        {['North Gate Active', 'Lobby A Active', 'Station 2 Caution', 'South Exit Active'].map((label) => (
          <span key={label} className="flex items-center gap-1.5 text-sm text-gray-400">
            <span className={`w-2 h-2 rounded-full ${label.includes('Caution') ? 'bg-status-amber' : 'bg-status-green'}`} aria-hidden="true" />
            {label}
          </span>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-500 uppercase">Manual Controls</span>
          <Button variant="danger" size="sm" disabled={manualLoading.alert} onClick={handleSendAlert}>
            Send Alert
          </Button>
          {entryEnabled ? (
            <Button variant="secondary" size="sm" disabled={manualLoading.entry} onClick={() => handleEntryToggle(false)}>
              Disable Entry
            </Button>
          ) : (
            <Button variant="primary" size="sm" disabled={manualLoading.entry} onClick={() => handleEntryToggle(true)}>
              Enable Entry
            </Button>
          )}
          <Button variant="secondary" size="sm" disabled={manualLoading.resolveAll} onClick={handleMarkAllResolved}>
            Mark All Resolved
          </Button>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Last Sync: {lastSync.toLocaleTimeString()}</span>
          <span>Network: Ultra-Low Latency</span>
        </div>
      </div>
    </div>
  );
}
