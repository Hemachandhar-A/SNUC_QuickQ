import { Outlet, NavLink } from 'react-router-dom';
import { HeaderActions } from '../components/HeaderActions';

const nav = [
  { to: '/admin', end: true, label: 'Overview' },
  { to: '/admin/forecast', label: 'Demand Forecast' },
  { to: '/admin/heatmap', label: 'Heatmap' },
  { to: '/admin/audit', label: 'Fairness Audit' },
  { to: '/admin/sustainability', label: 'Sustainability' },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-graphite flex w-full">
      <aside className="w-56 border-r border-slate/50 bg-charcoal/50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate/30">
          <span className="font-semibold text-white">Admin Intelligence</span>
          <p className="text-xs text-gray-500 mt-1">Institutional Flow AI</p>
        </div>
        <nav className="flex-1 p-2" aria-label="Admin navigation">
          {nav.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-accent-blue/20 text-accent-cyan' : 'text-gray-400 hover:text-white'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-14 border-b border-slate/50 flex items-center justify-between px-4 bg-graphite/95 backdrop-blur-md">
          <span className="text-gray-400 text-sm">Admin</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm hidden sm:inline">System Time: {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
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
