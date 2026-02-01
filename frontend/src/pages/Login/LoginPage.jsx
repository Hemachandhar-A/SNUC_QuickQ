import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';

const ROLES = [
  { id: 'student', label: 'STUDENT', icon: '👤' },
  { id: 'staff', label: 'STAFF', icon: '💼' },
  { id: 'admin', label: 'ADMIN', icon: '⚙️' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemStatus] = useState({ status: 'online' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login({ email: email || 'user@institution.edu', password: password || '••••••••', role });
      setAuth(res.token, res.user);
      if (res.user.role === 'student') navigate('/student', { replace: true });
      else if (res.user.role === 'staff') navigate('/staff', { replace: true });
      else navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-graphite flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.08)_0%,transparent_50%)]" aria-hidden="true" />
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent-blue/20 flex items-center justify-center">
            <span className="text-accent-blue font-bold text-sm">Q</span>
          </div>
          <span className="font-semibold text-white">Institutional Entry</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${systemStatus.status === 'online' ? 'bg-status-green' : 'bg-status-amber'}`} aria-hidden="true" />
          <span className="text-sm text-gray-400 uppercase">SYSTEM {systemStatus.status === 'online' ? 'ONLINE' : 'LIMITED'}</span>
        </div>
      </header>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-slate/50">
        <CardBody className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-1">Queue Intelligence & Flow Management</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label htmlFor="access-level" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Access Level
              </label>
              <div className="flex gap-2" role="group" aria-label="Select role">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition ${
                      role === r.id
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-cyan'
                        : 'border-slate bg-charcoal/50 text-gray-400 hover:text-white'
                    }`}
                    aria-pressed={role === r.id}
                  >
                    <span aria-hidden="true">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">@</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-charcoal border border-slate text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                  autoComplete="email"
                  aria-label="Institutional email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                  Password
                </label>
                <a href="#" className="text-xs text-accent-blue hover:underline">Forgot?</a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-12 py-2.5 rounded-lg bg-charcoal border border-slate text-white placeholder-gray-500 focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                  autoComplete="current-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-status-red text-sm" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Authenticating…' : 'Authenticate & Enter'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm text-accent-blue">
            <span aria-hidden="true">🛡</span>
            <span>256-BIT AES ENCRYPTION ACTIVE</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            © 2024 Institutional Intelligence Systems. All flow management protocols monitored and logged.
          </p>
        </CardBody>
      </Card>

      <footer className="absolute bottom-4 left-0 right-0 flex justify-center gap-6 text-sm text-gray-500">
        <a href="#" className="hover:text-gray-400">Privacy Policy</a>
        <a href="#" className="hover:text-gray-400">System Architecture</a>
        <a href="#" className="hover:text-gray-400">Emergency Support</a>
      </footer>
    </div>
  );
}
