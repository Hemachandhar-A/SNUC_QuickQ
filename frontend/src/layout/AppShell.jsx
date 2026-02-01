import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AppShell() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-graphite text-gray-200">
      <header className="sticky top-0 z-40 border-b border-slate/50 bg-graphite/95 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-accent-blue/20 flex items-center justify-center">
              <span className="text-accent-blue font-bold text-sm">Q</span>
            </div>
            <span className="font-semibold text-white hidden sm:inline">Queue Intelligence</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs text-gray-500 uppercase hidden sm:inline">{user?.role}</span>
            <span className="w-8 h-8 rounded-full bg-slate flex items-center justify-center text-xs font-medium text-gray-400">
              {user?.name?.slice(0, 1) || 'U'}
            </span>
          </div>
        </div>
      </header>
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
