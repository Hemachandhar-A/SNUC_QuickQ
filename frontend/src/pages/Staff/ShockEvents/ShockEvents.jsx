import { useState, useEffect } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { staff, analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

const INCIDENT_TYPES = [
  { id: 'gas', label: 'Gas Delay', icon: '🔥', recoveryMins: 45 },
  { id: 'power', label: 'Power Issue', icon: '⚡', recoveryMins: 15 },
  { id: 'staff', label: 'Staff Shortage', icon: '👥', recoveryMins: 30 },
  { id: 'service', label: 'Service Delay', icon: '⏱', recoveryMins: 20 },
];

export default function ShockEvents() {
  const shockEvent = useRealtimeStore((s) => s.shockEvent);
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const waitMinutes = useRealtimeStore((s) => s.waitMinutes);
  const processRate = useRealtimeStore((s) => s.processRate) ?? 12;
  const [activeType, setActiveType] = useState('gas');
  const [shockMode, setShockMode] = useState(!!shockEvent);
  const [loadingTrigger, setLoadingTrigger] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [incidentHistory, setIncidentHistory] = useState([]);

  useEffect(() => {
    setShockMode(!!shockEvent);
  }, [shockEvent]);

  useEffect(() => {
    analytics.dailySummary({ limit: 15 }).then((list) => {
      setIncidentHistory(list.filter((e) => e.type === 'shock' || e.type === 'shock_resolved' || e.type === 'alert'));
    }).catch(() => setIncidentHistory([]));
  }, [shockEvent]);

  const handleTrigger = async () => {
    setLoadingTrigger(true);
    try {
      await staff.shockTrigger({ type: activeType });
      setShockMode(true);
    } catch (_) {}
    setLoadingTrigger(false);
  };

  const handleResolve = async () => {
    setLoadingResolve(true);
    try {
      await staff.shockResolve();
      setShockMode(false);
    } catch (_) {}
    setLoadingResolve(false);
  };

  const currentType = INCIDENT_TYPES.find((t) => t.id === (shockEvent?.id || activeType)) || INCIDENT_TYPES[0];
  const current = shockEvent || {
    type: currentType.label,
    message: `${currentType.label} has been detected. Please remain in your current location until further notice.`,
  };
  const recoveryMins = currentType.recoveryMins ?? 45;
  const timelineSteps = [
    { t: 'NOW', title: 'Shock Protocol Active', sub: `Event: ${current.type}.`, active: shockMode },
    { t: `T + ${Math.round(recoveryMins * 0.35)}m`, title: 'Personnel Redirection', sub: '82% Historic Confidence.' },
    { t: `T + ${Math.round(recoveryMins * 0.7)}m`, title: 'Stabilization', sub: 'Manual check required.' },
    { t: `T + ${recoveryMins}m`, title: 'Full Restoration', sub: 'Estimated normalization.', done: !shockMode },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Shock Events Control</h1>
      <div className="flex items-center gap-3">
        <span className="text-status-amber" aria-hidden="true">⚠</span>
        <span className="text-status-amber font-medium">System Mode: {shockMode ? 'Protocol Pending' : 'Normal'}</span>
        <div className="flex rounded-lg overflow-hidden border border-slate">
          <button
            type="button"
            onClick={() => !shockMode && setShockMode(false)}
            className={`px-4 py-2 text-sm font-medium ${!shockMode ? 'bg-slate text-white' : 'bg-charcoal text-gray-400'}`}
          >
            Normal
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${shockMode ? 'bg-status-red text-white' : 'bg-charcoal text-gray-400'}`}
          >
            Shock Mode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Student Alert Preview" action={<button type="button" className="text-accent-blue text-sm">Edit Message</button>} />
            <CardBody>
              <div className="max-w-xs mx-auto p-4 rounded-xl bg-graphite border-2 border-slate">
                <div className="bg-status-red/20 border border-status-red/50 rounded-lg p-3 mb-3">
                  <p className="text-status-red font-bold text-sm flex items-center gap-2">
                    <span aria-hidden="true">◆</span> URGENT ALERT
                  </p>
                </div>
                <p className="text-sm text-gray-300">
                  {current.message}
                </p>
              </div>
            </CardBody>
          </Card>
          <Card className="border-2 border-status-red/50">
            <CardHeader title="DANGER ZONE" />
            <CardBody>
              <p className="text-gray-400 text-sm mb-4">
                Triggering shock protocol will lock down main corridors and broadcast emergency signals to 4,200 devices.
              </p>
              <Button variant="danger" size="lg" onClick={handleTrigger} disabled={loadingTrigger || shockMode}>
                ◆ TRIGGER SHOCK PROTOCOL
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="RESOLUTION PHASE" />
            <CardBody>
              <p className="text-gray-400 text-sm mb-4">
                Resolve incident to release door locks and send &apos;All Clear&apos; notifications.
              </p>
              <Button variant="secondary" size="lg" onClick={handleResolve} disabled={loadingResolve || !shockMode}>
                ✓ RESOLVE INCIDENT
              </Button>
            </CardBody>
          </Card>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Risk Level</span>
            <div className="flex-1 h-2 rounded-full bg-slate overflow-hidden">
              <div className="h-full w-4/5 bg-status-amber rounded-full" />
            </div>
            <span className="text-status-amber text-sm font-medium">CRITICAL</span>
          </div>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Active Incident Types" />
            <CardBody className="space-y-2">
              {INCIDENT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveType(t.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${
                    shockEvent && shockEvent.id === t.id
                      ? 'bg-status-red/20 border border-status-red/50 text-status-red'
                      : activeType === t.id
                      ? 'bg-slate/50 border border-accent-blue/50 text-white'
                      : 'bg-charcoal/50 text-gray-400 hover:text-white'
                  }`}
                >
                  <span aria-hidden="true">{t.icon}</span>
                  <span className="font-medium">{t.label}</span>
                  {shockEvent && shockEvent.id === t.id && <span className="text-xs ml-auto">ACTIVE ALERT</span>}
                </button>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Live Stats" subtitle="Current queue and wait (affected by shock)." />
            <CardBody className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Queue Now</p>
                <p className="text-xl font-bold text-white tabular-nums">{queueCount ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Est. Wait</p>
                <p className="text-xl font-bold text-white tabular-nums">{waitMinutes ?? 0}m</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Process Rate</p>
                <p className="text-xl font-bold text-white tabular-nums">{processRate} p/min</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Recovery Est.</p>
                <p className="text-xl font-bold text-white tabular-nums">{recoveryMins}m</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Recovery Timeline" subtitle={`Predicted normalization: ${recoveryMins}m for ${currentType.label}.`} />
            <CardBody className="space-y-3">
              {timelineSteps.map((step) => (
                <div key={step.t} className="flex gap-3">
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${step.active ? 'bg-status-red' : step.done ? 'bg-status-green' : 'bg-slate'}`} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-white text-sm">{step.t} — {step.title}</p>
                    <p className="text-xs text-gray-500">{step.sub}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card className="border border-accent-blue/30">
            <CardHeader title="Incident History" />
            <CardBody className="max-h-32 overflow-y-auto space-y-2">
              {incidentHistory.length === 0 ? (
                <p className="text-xs text-gray-500">No recent shock/alert events.</p>
              ) : (
                incidentHistory.slice(0, 6).map((e, i) => (
                  <div key={e.id || i} className="flex items-center gap-2 text-xs">
                    <span className={e.type === 'shock_resolved' ? 'text-status-green' : 'text-status-amber'}>{e.type === 'shock_resolved' ? '✓' : '◆'}</span>
                    <span className="text-gray-400">{e.type}</span>
                    <span className="text-gray-500">{e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : ''}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="AI Confidence" />
            <CardBody>
              <p className="text-xl font-bold text-white">HIGH: 94%</p>
              <p className="text-xs text-gray-500 mt-1">Recovery estimate based on incident type and historic resolution times.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
