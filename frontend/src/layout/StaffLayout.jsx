import { Outlet, NavLink } from 'react-router-dom';
import { HeaderActions } from '../components/HeaderActions';

const nav = [
  { to: '/staff', end: true, label: 'Dashboard' },
  { to: '/staff/monitor', label: 'Queue Monitor' },
  { to: '/staff/shock', label: 'Shock Events' },
];

export function StaffLayout() {
  return (
    <div className="min-h-screen bg-graphite flex w-full">
      <aside className="w-56 border-r border-slate/50 bg-charcoal/50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate/30">
          <div className="flex items-center gap-2">
            <span className="text-status-green text-xl" aria-hidden="true">⚡</span>
            <span className="font-semibold text-white">POWER PANEL</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Operational Intelligence</p>
        </div>
        <nav className="flex-1 p-2" aria-label="Staff navigation">
          {nav.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-status-green/20 text-status-green' : 'text-gray-400 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-slate/30">
          <button type="button" className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-status-red/20 text-status-red text-sm font-medium hover:bg-status-red/30 transition">
            <span aria-hidden="true">◆</span> EMERGENCY OVERRIDE
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate/50 flex items-center justify-between px-4 bg-graphite/95 backdrop-blur-md">
          <span className="text-gray-400 text-sm">Staff Control</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-green" aria-hidden="true" />
            <span className="text-status-green text-sm font-medium">SYSTEM LIVE</span>
            <HeaderActions />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
