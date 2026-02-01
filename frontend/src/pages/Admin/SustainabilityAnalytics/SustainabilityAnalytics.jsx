import { useState, useEffect } from 'react';
import { analytics } from '../../../api/client';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export default function SustainabilityAnalytics() {
  const [data, setData] = useState([]);
  const [range, setRange] = useState('Oct 24, 2023 - Oct 31, 2023');
  const [view, setView] = useState('daily');

  useEffect(() => {
    analytics.sustainability({ limit: 50 }).then(setData).catch(() => setData([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sustainability Analytics</h1>
          <p className="text-gray-400 mt-1">Real-time plate return sensor intelligence.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="px-3 py-2 rounded-lg border border-slate text-sm text-gray-400 flex items-center gap-1">
            <span aria-hidden="true">📅</span> {range}
          </button>
          <span className="w-10 h-10 rounded-full bg-slate flex items-center justify-center text-sm relative">
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-status-red flex items-center justify-center text-xs font-bold">+3</span>
            👤
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Total Waste Volume</p>
            <p className="text-3xl font-bold text-white mt-1">428.5 kg</p>
            <span className="text-sm text-status-red mt-1">12% ↑</span>
            <div className="mt-2 h-1.5 rounded-full bg-slate overflow-hidden">
              <div className="h-full w-3/4 bg-status-red/50 rounded-full" />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Completion Ratio</p>
            <p className="text-3xl font-bold text-white mt-1">74.2%</p>
            <span className="text-sm text-status-green mt-1">5.8% ↑</span>
            <div className="mt-2 h-1.5 rounded-full bg-slate overflow-hidden">
              <div className="h-full w-[74%] bg-status-green/50 rounded-full" />
            </div>
          </CardBody>
        </Card>
        <Card className="border-status-green/30">
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Carbon Saved</p>
            <p className="text-3xl font-bold text-white mt-1">1.2 Tons</p>
            <p className="text-sm text-gray-400 mt-1">Eq. 48 trees planted</p>
          </CardBody>
        </Card>
        <Card className="border-accent-cyan/30">
          <CardBody>
            <p className="text-xs text-gray-500 uppercase">Water Offset</p>
            <p className="text-3xl font-bold text-white mt-1">4,500 L</p>
            <p className="text-sm text-gray-400 mt-1">Eq. 75 shower cycles</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="7-Day Waste Trend"
            subtitle="Fluctuations in daily organic waste collection"
            action={
              <div className="flex gap-2">
                <button type="button" onClick={() => setView('daily')} className={`px-2 py-1 rounded text-xs font-medium ${view === 'daily' ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400'}`}>DAILY</button>
                <button type="button" onClick={() => setView('weekly')} className={`px-2 py-1 rounded text-xs font-medium ${view === 'weekly' ? 'bg-accent-blue text-white' : 'bg-charcoal text-gray-400'}`}>WEEKLY</button>
              </div>
            }
          />
          <CardBody>
            <div className="h-48 flex items-end gap-2">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, i) => (
                <div key={d} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-status-green/60 rounded-t transition-all duration-500" style={{ height: `${40 + Math.random() * 50}%` }} />
                  <span className="text-xs text-gray-500">{d}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader
            title="Waste Distribution"
            subtitle="Consumer consumption behavior"
          />
          <CardBody className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--status-green)" strokeWidth="12" strokeDasharray="186 251" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--status-red)" strokeWidth="12" strokeDasharray="54 251" strokeDashoffset="-186" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--gray-600)" strokeWidth="12" strokeDasharray="11 251" strokeDashoffset="-240" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">74%</span>
                <span className="text-xs text-gray-400">EATEN</span>
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-green" /> Consumed 74.2%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-red/60" /> Organic Waste 21.5%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-500" /> Contaminants 4.3%</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Congestion Impact Analysis"
            subtitle="Leftover levels vs. Peak service congestion"
            action={
              <div className="flex gap-2">
                <button type="button" className="px-2 py-1 rounded text-xs font-medium bg-accent-blue text-white">LUNCH</button>
                <button type="button" className="px-2 py-1 rounded text-xs font-medium bg-charcoal text-gray-400">DINNER</button>
              </div>
            }
          />
          <CardBody>
            <div className="h-32 flex items-end gap-1">
              {['11:00', '12:00', '13:00', '14:00'].map((t, i) => (
                <div key={t} className="flex-1 bg-status-green/50 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} title={t} />
              ))}
            </div>
            <p className="text-sm text-status-green mt-2">38% Peak</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Waste Hotspots" />
          <CardBody className="space-y-3">
            {[
              { name: 'Mediterranean Lamb', badge: 'HIGH WASTE', variant: 'danger', rate: '42% of portion' },
              { name: 'Classic Beef Stew', badge: 'MODERATE', variant: 'warning', rate: '28% of portion' },
              { name: 'Time: 13:15-13:30', badge: 'EFFICIENCY GAP', variant: 'success', rate: 'Peak waste window' },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between p-2 rounded-lg bg-charcoal/50">
                <div>
                  <p className="font-medium text-white text-sm">{row.name}</p>
                  <p className="text-xs text-gray-400">{row.rate}</p>
                </div>
                <Badge variant={row.variant}>{row.badge}</Badge>
                <button type="button" className="text-gray-500 hover:text-white" aria-label="View">👁</button>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
