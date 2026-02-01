import { useEffect } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function StudentHome() {
  const waitMinutes = useRealtimeStore((s) => s.waitMinutes);
  const confidence = useRealtimeStore((s) => s.confidence);
  const queueCount = useRealtimeStore((s) => s.queueCount);
  const congestionLevel = useRealtimeStore((s) => s.congestionLevel);
  const bestTimeToArrive = useRealtimeStore((s) => s.bestTimeToArrive);
  const capacityPercent = useRealtimeStore((s) => s.capacityPercent);

  const congestionVariant = congestionLevel === 'high' ? 'danger' : congestionLevel === 'medium' ? 'warning' : 'success';

  return (
    <div className="space-y-6">
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
              <Button className="mt-4" size="sm">
                <span className="mr-2" aria-hidden="true">🔔</span>
                Set Reminder
              </Button>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Current Capacity" />
            <CardBody>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate overflow-hidden">
                  <div
                    className="h-full bg-accent-blue rounded-full transition-all duration-500"
                    style={{ width: `${capacityPercent || 78}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-white tabular-nums">{capacityPercent || 78}%</span>
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
          <div className="h-48 flex items-end gap-1">
            {Array.from({ length: 24 }, (_, i) => {
              const h = 12 + (i / 24) * 2;
              const val = 30 + Math.sin((i / 6) * Math.PI) * 40 + Math.random() * 20;
              return (
                <div
                  key={i}
                  className="flex-1 bg-accent-blue/40 rounded-t min-w-0 transition-all duration-300"
                  style={{ height: `${Math.min(100, val)}%` }}
                  title={`~${Math.round(val)}% density`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>12:00 PM</span>
            <span>2:00 PM</span>
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
          { label: 'TOTAL SERVERS', value: '12/12' },
          { label: 'AVG PROCESS RATE', value: '45 p/min' },
          { label: "TODAY'S PEAK", value: '24 min' },
          { label: 'ACTIVE USERS', value: queueCount || '142' },
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
