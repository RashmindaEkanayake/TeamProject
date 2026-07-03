import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const Login: React.FC = () => {
  const [role, setRole] = useState('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    if (selectedRole === 'admin') {
      setUsername('admin');
      setPassword('password123');
    } else if (selectedRole === 'sales') {
      setUsername('salesrep');
      setPassword('password123');
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loginUser = username.trim();
      if (loginUser.includes('@')) {
        loginUser = loginUser.split('@')[0];
      }

      const data = await authService.login({ username: loginUser, password });
      
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/sales/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Invalid credentials. Please verify your username and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-md relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent/10 blur-[100px] animate-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1100px] flex flex-col md:flex-row glass-panel rounded-2xl overflow-hidden animate-fade-in-up">
        
        {/* Left Branding Panel */}
        <div className="hidden md:flex md:w-5/12 relative bg-surface-elevated/40 items-center justify-center overflow-hidden border-r border-glass-border">
          <div className="absolute inset-0 bg-hero-gradient opacity-20"></div>
          
          <div className="relative z-10 p-xl flex flex-col items-start w-full">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-lg shadow-lg">
              <span className="material-symbols-outlined text-[36px] text-on-surface">data_exploration</span>
            </div>
            
            <h1 className="text-4xl font-bold text-on-surface tracking-tight mb-md">Nexus <span className="text-secondary">ERP</span></h1>
            <p className="text-on-surface-muted text-lg mb-xl leading-relaxed">
              State-of-the-art enterprise resource planning. Manage global supply chains with precision.
            </p>
            
            <div className="mt-auto space-y-md w-full">
              <div className="flex items-center gap-md p-md rounded-xl bg-surface/50 border border-glass-border">
                <span className="material-symbols-outlined text-on-surface text-2xl">verified_user</span>
                <div>
                  <h4 className="text-on-surface font-medium">Enterprise Security</h4>
                  <p className="text-on-surface-muted text-sm">256-bit AES encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-md p-md rounded-xl bg-surface/50 border border-glass-border">
                <span className="material-symbols-outlined text-secondary text-2xl">speed</span>
                <div>
                  <h4 className="text-on-surface font-medium">High Performance</h4>
                  <p className="text-on-surface-muted text-sm">99.99% Uptime SLA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login Form Panel */}
        <div className="w-full md:w-7/12 p-xl md:p-[60px] flex flex-col justify-center bg-surface/80 backdrop-blur-md">
          <div className="mb-10">
            <div className="md:hidden flex items-center gap-sm mb-lg">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface text-xl">data_exploration</span>
              </div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">Nexus ERP</h1>
            </div>
            <h2 className="text-3xl font-semibold text-on-surface mb-2 tracking-tight">Welcome back</h2>
            <p className="text-on-surface-muted">Sign in to your account to continue.</p>
          </div>

          {error && (
            <div className="mb-lg p-md bg-error/10 text-error font-medium rounded-xl border border-error/20 flex items-center gap-sm animate-fade-in">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            
            {/* Access Level role select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-on-surface-muted uppercase" htmlFor="role">Access Level</label>
              <div className="relative group">
                <select 
                  className="w-full h-14 pl-12 pr-10 border border-glass-border rounded-xl bg-surface-elevated text-on-surface appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none group-hover:border-outline cursor-pointer" 
                  id="role"
                  value={role}
                  onChange={handleRoleChange}
                >
                  <option value="admin">System Administrator</option>
                  <option value="sales">Sales Representative</option>
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted group-hover:text-on-surface transition-colors">
                  {role === 'admin' ? 'admin_panel_settings' : 'sell'}
                </span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-muted pointer-events-none">expand_more</span>
              </div>
            </div>

            {/* Username/Email Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wider text-on-surface-muted uppercase" htmlFor="email">Corporate ID</label>
              <div className="relative group">
                <input 
                  className="w-full h-14 pl-12 pr-4 border border-glass-border rounded-xl bg-surface-elevated text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none group-hover:border-outline" 
                  id="email" 
                  placeholder="Enter your ID or email" 
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted group-hover:text-on-surface transition-colors">person</span>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold tracking-wider text-on-surface-muted uppercase" htmlFor="password">Password</label>
                <a className="text-xs font-medium text-on-surface hover:text-on-surface-hover hover:underline transition-colors" href="#forgot">Forgot password?</a>
              </div>
              <div className="relative group">
                <input 
                  className="w-full h-14 pl-12 pr-12 border border-glass-border rounded-xl bg-surface-elevated text-on-surface focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none group-hover:border-outline" 
                  id="password" 
                  placeholder="••••••••" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted group-hover:text-on-surface transition-colors">lock</span>
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-on-surface transition-colors flex items-center justify-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="relative flex items-center cursor-pointer">
                <input className="peer sr-only" id="remember" type="checkbox" />
                <div className="w-5 h-5 rounded border border-glass-border bg-surface-elevated peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface text-[16px] opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all duration-200">check</span>
                </div>
              </label>
              <label className="text-sm text-on-surface-muted cursor-pointer hover:text-on-surface transition-colors" htmlFor="remember">Remember this device</label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 bg-primary text-on-surface font-medium rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-50 disabled:active:scale-100 disabled:hover:shadow-none"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;
