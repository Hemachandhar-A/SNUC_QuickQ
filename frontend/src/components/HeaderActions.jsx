import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRealtimeStore } from '../store/realtimeStore';
import { Button } from './ui/Button';

export function HeaderActions() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const alerts = useRealtimeStore((s) => s.alerts);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const recentAlerts = alerts.slice(0, 8);
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="flex items-center gap-2">
      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          type="button"
          onClick={() => setNotifOpen((o) => !o)}
          className="relative w-9 h-9 rounded-full bg-slate/80 hover:bg-slate flex items-center justify-center text-gray-300 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label="Notifications"
          aria-expanded={notifOpen}
        >
          <span aria-hidden="true">🔔</span>
          {recentAlerts.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-status-red text-[10px] font-bold text-white flex items-center justify-center">
              {recentAlerts.length > 5 ? '5+' : recentAlerts.length}
            </span>
          )}
        </button>
        {notifOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-charcoal border border-slate shadow-xl z-50 py-2"
            role="menu"
            aria-label="Recent alerts"
          >
            <div className="px-4 py-2 border-b border-slate/50">
              <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
            </div>
            {recentAlerts.length === 0 ? (
              <p className="px-4 py-4 text-sm text-gray-500">No recent alerts.</p>
            ) : (
              <ul className="py-2">
                {recentAlerts.map((a) => (
                  <li key={a.id} className="px-4 py-2 hover:bg-slate/30 border-b border-slate/30 last:border-0">
                    <p className="text-sm font-medium text-white">{a.title || 'Alert'}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{a.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Profile + Logout */}
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((o) => !o)}
          className="flex items-center gap-2 w-9 h-9 rounded-full bg-slate/80 hover:bg-slate flex items-center justify-center text-gray-300 hover:text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label="Profile menu"
          aria-expanded={profileOpen}
        >
          <span className="text-sm font-medium uppercase">{displayName.charAt(0)}</span>
        </button>
        {profileOpen && (
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-charcoal border border-slate shadow-xl z-50 py-2"
            role="menu"
            aria-label="Profile menu"
          >
            <div className="px-4 py-2 border-b border-slate/50">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || '—'}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
            </div>
            <div className="py-2">
              <Button
                variant="danger"
                size="sm"
                className="w-full justify-center rounded-lg mx-2"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
