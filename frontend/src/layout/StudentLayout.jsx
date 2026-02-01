import { Outlet, NavLink } from 'react-router-dom';
import { useRealtimeStore } from '../store/realtimeStore';
import { HeaderActions } from '../components/HeaderActions';

const nav = [
  { to: '/student', end: true, label: 'Home' },
  { to: '/student/alerts', label: 'Alerts & Fairness' },
  { to: '/student/sustainability', label: 'Sustainability' },
];

export function StudentLayout() {
  const systemStatus = useRealtimeStore((s) => s.systemStatus);
  const shockEvent = useRealtimeStore((s) => s.shockEvent);

  return (
    <div className="min-h-screen bg-graphite w-full">
      <header className="sticky top-0 z-40 border-b border-slate/50 bg-graphite/95 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue font-bold text-sm">Q</span>
              </div>
              <span className="font-semibold text-white hidden sm:inline">Arrival Intelligence</span>
            </div>
            <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
              {nav.map(({ to, end, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded text-sm font-medium transition ${isActive ? 'bg-accent-blue/20 text-accent-cyan' : 'text-gray-400 hover:text-white'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <HeaderActions />
          </div>
        </div>
        <div className="border-t border-slate/30 bg-charcoal/50 px-4 py-1.5 flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${systemStatus.status === 'online' ? 'bg-status-green' : 'bg-status-amber'}`} aria-hidden="true" />
          <span className="text-gray-400">SYSTEM STATUS:</span>
          <span className={systemStatus.status === 'online' ? 'text-status-green' : 'text-status-amber'}>
            {systemStatus.status === 'online' ? 'FULLY OPERATIONAL' : systemStatus.message}
          </span>
          <span className="text-gray-500 hidden sm:inline">— Real-time updates from {systemStatus.source || 'Main Hall Mess'}</span>
        </div>
      </header>
      {shockEvent && (
        <div className="bg-status-red/10 border-b border-status-red/30 px-4 py-3 flex items-center justify-between gap-4">
          <span className="font-medium text-status-red">Active incident: {shockEvent.type}</span>
          <span className="text-sm text-gray-400">{shockEvent.message}</span>
        </div>
      )}
      <main className="w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
