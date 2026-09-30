import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login({ username, password });
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/sales/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] mb-4">
            <span className="material-symbols-outlined text-white text-3xl">inventory_2</span>
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">NEXUS ERP</h1>
          <p className="text-on-surface-muted text-sm mt-1">Enterprise Inventory & Sales Management</p>
        </div>

        {/* Card */}
        <div className="glass-panel bg-surface-elevated/70 p-8 rounded-3xl border border-glass-border shadow-2xl">
          <h2 className="text-xl font-bold text-on-surface mb-6">Sign In</h2>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted text-[18px]">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-glass-border rounded-xl text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Credential Pre-fills */}
          <div className="mt-8 pt-6 border-t border-glass-border">
            <p className="text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-3 text-center">
              Quick Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillCredentials('admin', 'password123')}
                className="px-3 py-2 rounded-xl bg-surface hover:bg-outline-variant border border-glass-border text-xs text-on-surface flex flex-col items-center transition-colors"
              >
                <span className="font-semibold text-primary">Administrator</span>
                <span className="text-[10px] text-on-surface-muted">admin / password123</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('salesrep', 'password123')}
                className="px-3 py-2 rounded-xl bg-surface hover:bg-outline-variant border border-glass-border text-xs text-on-surface flex flex-col items-center transition-colors"
              >
                <span className="font-semibold text-secondary">Sales Representative</span>
                <span className="text-[10px] text-on-surface-muted">salesrep / password123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
