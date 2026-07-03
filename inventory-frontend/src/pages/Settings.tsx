import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-xl">
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Settings</h1>
            <p className="text-on-surface-muted text-sm">Manage account preferences, access controls, and application settings.</p>
          </div>
        </div>
      </section>
      <section className="glass-panel bg-surface-elevated/40 rounded-lg border border-glass-border shadow-sm p-lg">
        <h2 className="text-xl font-bold text-on-surface mb-md">Account Settings</h2>
        <div className="grid gap-lg">
          <div className="rounded-lg bg-surface-elevated p-lg border border-glass-border">
            <p className="text-xs font-semibold text-label-md text-on-surface-muted">Security</p>
            <p className="text-sm text-on-surface">Configure password policies, authentication, and login settings.</p>
          </div>
          <div className="rounded-lg bg-surface-elevated p-lg border border-glass-border">
            <p className="text-xs font-semibold text-label-md text-on-surface-muted">Notifications</p>
            <p className="text-sm text-on-surface">Enable alerts for approvals, shipments, and order status changes.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
