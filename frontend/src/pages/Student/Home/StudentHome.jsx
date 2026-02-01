import { useState, useCallback, useRef, useEffect } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

const PROCESS_RATE = 12;
const MAX_QUEUE = 80;

function getDensityColor(pct) {
  if (pct <= 33) return 'bg-status-green';
  if (pct <= 66) return 'bg-status-amber';
  return 'bg-status-red';
}

export default function StudentHome() {
  const waitMinutes = useRealtimeStore((s) => s.waitMinutes);
  const confidence = useRealtimeStore((s) => s.confidence);
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const congestionLevel = useRealtimeStore((s) => s.congestionLevel);
  const bestTimeToArrive = useRealtimeStore((s) => s.bestTimeToArrive);
  const capacityPercent = useRealtimeStore((s) => s.capacityPercent);
  const [reminderSet, setReminderSet] = useState(false);
  const [reminderMins, setReminderMins] = useState(null);
  const reminderTimeoutRef = useRef(null);

  const congestionVariant = congestionLevel === 'high' ? 'danger' : congestionLevel === 'medium' ? 'warning' : 'success';

  const handleSetReminder = useCallback(() => {
    if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current);
    const mins = bestTimeToArrive?.arriveInMinutes ?? 15;
    setReminderMins(mins);
    setReminderSet(true);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    reminderTimeoutRef.current = setTimeout(() => {
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('Queue Intelligence', { body: `Best time to arrive is now. You could save ~${bestTimeToArrive?.estimatedSaveMinutes ?? 0} min wait.` });
      }
      setReminderSet(false);
      setReminderMins(null);
      reminderTimeoutRef.current = null;
    }, mins * 60 * 1000);
  }, [bestTimeToArrive]);

  useEffect(() => () => { if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current); }, []);

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const numBars = 24;
  const timeLabels = Array.from({ length: numBars + 1 }, (_, i) => {
    const t = new Date(now.getTime() + (i / numBars) * 2 * 60 * 60 * 1000);
    return t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  });
  const densityValues = Array.from({ length: numBars }, (_, i) => {
    const t = (i / numBars) * 2;
    const peak = 0.5 + 0.4 * Math.sin((t - 0.3) * Math.PI * 2);
    return Math.round(25 + peak * 50 + (Math.random() - 0.5) * 15);
  });

  const peakWaitToday = queueCount ? Math.ceil(queueCount / PROCESS_RATE) : 7;
  const totalServers = 4;

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold text-white">Student Home (Arrival Intelligence)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Wait Time</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-bold text-white tabular-nums" aria-live="polite">
                {waitMinutes}
              </span>
              <span className="text-xl text-gray-400">min</span>
            </div>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <Badge variant={congestionVariant}>
                {congestionLevel === 'high' ? 'HIGH' : congestionLevel === 'medium' ? 'MEDIUM' : 'LOW'} CONGESTION
              </Badge>
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <span className="text-accent-cyan" aria-hidden="true">✓</span>
                {confidence ? Math.round(confidence * 100) : 94}% Accuracy — Confidence Index
              </span>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Best Time to Arrive" subtitle="" action={<span className="text-gray-500" aria-hidden="true">🕐</span>} />
            <CardBody>
              <p className="text-gray-300">
                Arriving in <strong className="text-white">{bestTimeToArrive?.arriveInMinutes ?? 15}</strong> minutes will likely save you{' '}
                <strong className="text-white">{bestTimeToArrive?.estimatedSaveMinutes ?? 8}</strong> minutes of waiting time.
              </p>
              <Button className="mt-4" size="sm" onClick={handleSetReminder} disabled={reminderSet}>
                <span className="mr-2" aria-hidden="true">🔔</span>
                {reminderSet ? `Reminder set for ${reminderMins} min` : 'Set Reminder'}
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Current Capacity" />
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${capacityPercent > 66 ? 'bg-status-red' : capacityPercent > 33 ? 'bg-status-amber' : 'bg-status-green'}`}
                    style={{ width: `${Math.min(100, capacityPercent || 35)}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-white tabular-nums">{Math.min(100, capacityPercent || 35)}%</span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Arrival Trend"
          subtitle="Projected queue density for the next 2 hours"
        />
        <CardBody>
          <div className="h-48 flex items-end gap-0.5">
            {densityValues.map((val, i) => {
              const pct = Math.min(100, val);
              const colorClass = getDensityColor(pct);
              return (
                <div
                  key={i}
                  className={`flex-1 ${colorClass} rounded-t min-w-0 transition-all duration-300 opacity-90`}
                  style={{ height: `${pct}%` }}
                  title={`${timeLabels[i]} – ${Math.round(pct)}% density (${pct <= 33 ? 'Low' : pct <= 66 ? 'Medium' : 'High'})`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{timeLabels[0]}</span>
            <span>{timeLabels[timeLabels.length - 1]}</span>
          </div>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-green" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-amber" /> Medium</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-red" /> High</span>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL SERVERS', value: `${totalServers}/${totalServers}` },
          { label: 'AVG PROCESS RATE', value: `${PROCESS_RATE} p/min` },
          { label: "TODAY'S PEAK", value: `${peakWaitToday} min` },
          { label: 'IN QUEUE NOW', value: String(queueCount ?? 0) },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-gray-500 uppercase">{label}</p>
            <p className="text-xl font-semibold text-white mt-1">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
