import React from 'react';
import { authService } from '../services/api';

const Settings: React.FC = () => {
  const user = authService.getCurrentUser();

  return (
    <div className="space-y-xl animate-fade-in-up max-w-4xl">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Account & System Settings</h1>
        <p className="text-on-surface-muted text-sm mt-1">
          Review your profile credentials and connected backend service parameters.
        </p>
      </section>

      {/* User Profile Card */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl p-6 border border-glass-border">
        <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person</span>
          User Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">
              Full Name
            </label>
            <p className="text-sm font-medium text-on-surface p-3 bg-surface rounded-xl border border-glass-border">
              {user?.fullName || 'Not specified'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">
              Username
            </label>
            <p className="text-sm font-mono text-on-surface p-3 bg-surface rounded-xl border border-glass-border">
              {user?.username}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">
              Email Address
            </label>
            <p className="text-sm text-on-surface p-3 bg-surface rounded-xl border border-glass-border">
              {user?.email || '—'}
            </p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-on-surface-muted uppercase tracking-wider mb-1">
              Role Authority
            </label>
            <div className="p-3 bg-surface rounded-xl border border-glass-border flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">{user?.role}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* System Infrastructure Card */}
      <section className="glass-panel bg-surface-elevated/40 rounded-2xl p-6 border border-glass-border">
        <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">dns</span>
          Backend Infrastructure
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-glass-border">
            <span className="text-on-surface-muted">API Endpoint</span>
            <span className="font-mono text-on-surface text-xs bg-surface px-2.5 py-1 rounded-lg border border-glass-border">
              {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-glass-border">
            <span className="text-on-surface-muted">Database Engine</span>
            <span className="font-medium text-on-surface">H2 In-Memory (JDBC URL: jdbc:h2:mem:inventorydb)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-glass-border">
            <span className="text-on-surface-muted">Authentication Mode</span>
            <span className="font-medium text-on-surface">Stateless JWT (HMAC-SHA256)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2">
            <span className="text-on-surface-muted">H2 Web Console</span>
            <a
              href="http://localhost:8080/h2-console"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Open Console <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end">
        <button
          onClick={authService.logout}
          className="px-4 py-2.5 rounded-xl bg-error/10 border border-error/20 text-error hover:bg-error/20 text-sm font-semibold transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default Settings;
