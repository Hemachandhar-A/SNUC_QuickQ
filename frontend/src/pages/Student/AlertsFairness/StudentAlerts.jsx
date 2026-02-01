import { useState } from 'react';
import { useRealtimeStore } from '../../../store/realtimeStore';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function StudentAlerts() {
  const alerts = useRealtimeStore((s) => s.alerts);
  const [exceptionSubmitted, setExceptionSubmitted] = useState(false);

  const alertIcon = (type) => {
    if (type === 'warning' || type === 'surge') return '⚠️';
    if (type === 'success' || type === 'recovery') return '✓';
    return 'ℹ️';
  };
  const alertVariant = (severity) => (severity === 'critical' ? 'danger' : severity === 'warning' ? 'warning' : 'info');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Student Alerts & Fairness</h1>
        <p className="text-gray-400 mt-1">Real-time queue intelligence and fairness protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Live Alert Feed</h2>
            <Badge variant="info">REAL-TIME</Badge>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-gray-500 text-sm">No recent alerts. System normal.</p>
                  <p className="text-xs text-gray-600 mt-2">Alerts will appear here when queue surges, recovery notices, or shock events occur.</p>
                </CardBody>
              </Card>
            ) : (
              alerts.slice(0, 10).map((a) => (
                <Card key={a.id} className="border-l-4 border-l-status-amber/50">
                  <CardBody className="py-3 flex items-start gap-3">
                    <span className="text-lg" aria-hidden="true">{alertIcon(a.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{a.title || 'System Update'}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{a.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}</p>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>

          <Card>
            <CardHeader
              title="System Insight: Why is it slow?"
              action={<button type="button" className="text-gray-500 hover:text-white" aria-label="Settings">⚙</button>}
            />
            <CardBody>
              <p className="text-gray-300 text-sm">
                AI Diagnostic: Sudden inflow spike detected at North Entrance (45/min) exceeding serving capacity (30/min). Contributing factor: Shift change in Block-C. Expected stabilization: 12:20 PM.
              </p>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="YOUR STATUS" />
            <CardBody>
              <p className="text-2xl font-semibold text-gray-500">NOT ACTIVE</p>
              <p className="text-sm text-gray-400 mt-1">Standard Queue Protocol applies to your account.</p>
              {exceptionSubmitted ? (
                <p className="mt-4 text-sm text-accent-cyan">Request submitted. You&apos;ll be notified of the outcome.</p>
              ) : (
                <Button variant="secondary" className="mt-4 w-full" size="sm" onClick={() => setExceptionSubmitted(true)}>
                  REQUEST EXCEPTION
                </Button>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="FAIRNESS PROTOCOLS" />
            <CardBody className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">First-Come-First-Serve</span>
                  <Badge variant="info">ACTIVE</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">Strict timestamp ordering based on RFID portal entry.</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">Re-entry Cooldown</span>
                  <Badge variant="info">45 MINS</Badge>
                </div>
                <p className="text-xs text-gray-400 mt-1">Mandatory cooling period after meal verification to prevent double-queuing.</p>
              </div>
              <div>
                <p className="font-medium text-white">Verification Method</p>
                <p className="text-xs text-gray-400 mt-1">RFID + BIOMETRIC DUAL-SYNC</p>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="LIVE TRAFFIC HEATMAP" />
            <CardBody>
              <div className="h-32 bg-slate/30 rounded flex items-center justify-center text-gray-500 text-sm">
                Heatmap placeholder
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
