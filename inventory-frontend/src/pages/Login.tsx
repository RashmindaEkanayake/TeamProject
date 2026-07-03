import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'sales'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleChange = (selected: 'admin' | 'sales') => {
    setRole(selected);
    setError(null);
    if (selected === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else {
      setUsername('salesrep');
      setPassword('password123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let loginUser = username.trim();
      if (loginUser.includes('@')) loginUser = loginUser.split('@')[0];
      const data = await authService.login({ username: loginUser, password });
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/sales/dashboard');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Invalid credentials. Please check your ID and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

      {/* ── Animated ambient blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)', animationDelay: '2s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-float"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.07) 0%, transparent 70%)' }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* ── Main card ── */}
      <div
        className={`relative z-10 w-full max-w-[980px] mx-4 flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/[0.06] transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        style={{ background: 'rgba(18,18,20,0.85)', backdropFilter: 'blur(24px)' }}
      >

        {/* ══ LEFT PANEL — Branding ══ */}
        <div className="hidden lg:flex lg:w-5/12 flex-col relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.08) 50%, rgba(244,63,94,0.06) 100%)' }}
        >
          {/* decorative blobs inside panel */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
          />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 animate-float"
            style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }}
          />

          <div className="relative z-10 flex flex-col h-full p-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
              >
                <span className="material-symbols-outlined text-white text-xl">data_exploration</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">Nexus ERP</h1>
                <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-[0.2em] mt-0.5">Enterprise</p>
              </div>
            </div>

            {/* Hero content */}
            <div className="py-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs text-indigo-300 font-medium">Secure Access Portal</span>
              </div>
              <h2 className="text-4xl font-bold text-white leading-[1.15] mb-4">
                Intelligent<br />
                <span style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Inventory Control
                </span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage your supply chain, track orders, and gain real‑time business insights from one unified workspace.
              </p>
            </div>

            {/* Feature chips */}
            <div className="space-y-3">
              {[
                { icon: 'verified_user', label: 'Role‑Based Access Control', color: '#6366f1' },
                { icon: 'analytics', label: 'Real‑Time Inventory Analytics', color: '#06b6d4' },
                { icon: 'speed', label: '99.9% Uptime Guaranteed', color: '#10b981' },
              ].map(f => (
                <div key={f.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${f.color}20` }}
                  >
                    <span className="material-symbols-outlined text-base" style={{ color: f.color }}>{f.icon}</span>
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <p className="mt-8 text-[11px] text-slate-600">
              © 2025 Nexus ERP · All rights reserved
            </p>
          </div>
        </div>

        {/* ══ RIGHT PANEL — Form ══ */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center p-8 sm:p-12"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
            >
              <span className="material-symbols-outlined text-white text-lg">data_exploration</span>
            </div>
            <h1 className="text-lg font-bold text-white">Nexus ERP</h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-400 text-sm">Sign in to access your workspace</p>
          </div>

          {/* ── Role selector ── */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Access Level
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              {([
                { key: 'admin', label: 'System Admin', icon: 'admin_panel_settings' },
                { key: 'sales', label: 'Sales Rep', icon: 'sell' },
              ] as const).map(r => (
                <button
                  key={r.key}
                  type="button"
                  id={`role-${r.key}`}
                  onClick={() => handleRoleChange(r.key)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    role === r.key
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={role === r.key ? {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.9))',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
                  } : {}}
                >
                  <span className="material-symbols-outlined text-[18px]">{r.icon}</span>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Error banner ── */}
          {error && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/25 animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.08)' }}
            >
              <span className="material-symbols-outlined text-red-400 text-base mt-0.5 flex-shrink-0">error</span>
              <p className="text-sm text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2" htmlFor="login-username">
                Corporate ID
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username or email"
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all border"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                    e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest" htmlFor="login-password">
                  Password
                </label>
                <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-[52px] pl-12 pr-12 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none transition-all border"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.6)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
                    e.currentTarget.style.background = 'rgba(99,102,241,0.05)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3 pt-1">
              <label className="relative flex items-center cursor-pointer gap-3">
                <input id="remember-me" type="checkbox" className="peer sr-only" />
                <div className="w-[18px] h-[18px] rounded-[5px] border border-white/[0.12] bg-white/[0.04] peer-checked:bg-indigo-500 peer-checked:border-indigo-500 flex items-center justify-center transition-all flex-shrink-0">
                  <span className="material-symbols-outlined text-white text-[12px] opacity-0 peer-checked:opacity-100 transition-opacity">check</span>
                </div>
                <span className="text-sm text-slate-400 hover:text-slate-300 transition-colors select-none">
                  Keep me signed in
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{
                  background: loading
                    ? 'rgba(99,102,241,0.6)'
                    : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(99,102,241,0.4)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(99,102,241,0.55)';
                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* ── Divider + demo hint ── */}
          <div className="mt-8 pt-6 border-t border-white/[0.05]">
            <p className="text-center text-xs text-slate-600 mb-4">Demo credentials are pre‑filled based on selected role</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: 'Admin', user: 'admin', icon: 'admin_panel_settings', color: '#6366f1' },
                { role: 'Sales Rep', user: 'salesrep', icon: 'sell', color: '#06b6d4' },
              ].map(d => (
                <button
                  key={d.role}
                  type="button"
                  id={`quick-login-${d.user}`}
                  onClick={() => handleRoleChange(d.role === 'Admin' ? 'admin' : 'sales')}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] group"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = `${d.color}40`;
                    (e.currentTarget as HTMLButtonElement).style.background = `${d.color}08`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${d.color}15` }}
                  >
                    <span className="material-symbols-outlined text-[16px]" style={{ color: d.color }}>{d.icon}</span>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-xs font-semibold text-slate-300 truncate">{d.role}</p>
                    <p className="text-[11px] text-slate-600 font-mono truncate">{d.user}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
