import React, { useState } from 'react';
import { authService } from '../services/api';

const Settings: React.FC = () => {
  const currentUser = authService.getCurrentUser() || {
    fullName: 'Administrator',
    email: 'admin@inventoryflow.com',
    role: 'ADMIN',
    username: 'admin',
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'preferences'>('profile');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  });

  // Profile Form state
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email, setEmail] = useState(currentUser.email || '');

  // Notification Toggles state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [priceApprovalAlerts, setPriceApprovalAlerts] = useState(true);
  const [orderStatusAlerts, setOrderStatusAlerts] = useState(false);

  // System Preferences
  const [currency, setCurrency] = useState('USD');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle dark/light theme on <html> element
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', newTheme);
    showToast(`Theme switched to ${newTheme.toUpperCase()} mode!`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...currentUser, fullName, email };
    localStorage.setItem('user', JSON.stringify(updated));
    showToast('Profile information successfully saved!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated successfully!');
  };

  return (
    <div className="space-y-xl animate-fade-in-up pb-12">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-on-surface px-5 py-3 rounded-xl shadow-2xl border border-glass-border flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-success">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <section>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Settings & Preferences</h1>
            <p className="text-on-surface-muted text-sm mt-1">
              Manage account details, notification rules, application appearance, and security policies.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Sidebar Navigation + Settings Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-lg">
        {/* Navigation Tabs */}
        <div className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border p-3 space-y-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-on-surface shadow-md'
                : 'text-on-surface-muted hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">person</span>
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'preferences'
                ? 'bg-primary text-on-surface shadow-md'
                : 'text-on-surface-muted hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">palette</span>
            Appearance & Preferences
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'notifications'
                ? 'bg-primary text-on-surface shadow-md'
                : 'text-on-surface-muted hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">notifications</span>
            Notifications & Alerts
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-primary text-on-surface shadow-md'
                : 'text-on-surface-muted hover:text-on-surface hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-base">security</span>
            Security & Credentials
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="glass-panel bg-surface-elevated/40 rounded-2xl border border-glass-border p-6 sm:p-8">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="border-b border-glass-border pb-4">
                <h2 className="text-xl font-bold text-on-surface">User Profile</h2>
                <p className="text-xs text-on-surface-muted mt-1">Manage your account identity and role details.</p>
              </div>

              {/* User Avatar Card */}
              <div className="flex items-center gap-5 p-4 rounded-xl bg-surface-elevated border border-glass-border">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary text-white font-bold text-2xl flex items-center justify-center shadow-lg">
                  {(fullName || 'A')[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">{fullName || 'User'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold border border-primary/30">
                      {currentUser.role}
                    </span>
                    <span className="text-xs text-on-surface-muted font-mono">@{currentUser.username}</span>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-glass-border">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-surface text-xs font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: APPEARANCE & PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="border-b border-glass-border pb-4">
                <h2 className="text-xl font-bold text-on-surface">Appearance & Localization</h2>
                <p className="text-xs text-on-surface-muted mt-1">Customize visual themes, currency formats, and regional settings.</p>
              </div>

              {/* Theme Mode Selector */}
              <div>
                <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-3">Color Theme Mode</label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    type="button"
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      theme === 'dark'
                        ? 'bg-surface-elevated border-primary ring-2 ring-primary/30 shadow-lg'
                        : 'bg-surface-elevated/40 border-glass-border hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">dark_mode</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Dark Mode</p>
                        <p className="text-[10px] text-on-surface-muted">Sleek dark interface</p>
                      </div>
                    </div>
                    {theme === 'dark' && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      theme === 'light'
                        ? 'bg-surface-elevated border-primary ring-2 ring-primary/30 shadow-lg'
                        : 'bg-surface-elevated/40 border-glass-border hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-warning">light_mode</span>
                      <div>
                        <p className="text-xs font-bold text-on-surface">Light Mode</p>
                        <p className="text-[10px] text-on-surface-muted">High contrast light design</p>
                      </div>
                    </div>
                    {theme === 'light' && <span className="material-symbols-outlined text-primary text-base">check_circle</span>}
                  </button>
                </div>
              </div>

              {/* Currency & Localization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-glass-border">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">System Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="LKR">LKR (Rs) - Sri Lankan Rupee</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">Date Display Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-01)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (01/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (10/01/2026)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-glass-border pb-4">
                <h2 className="text-xl font-bold text-on-surface">Notification Preferences</h2>
                <p className="text-xs text-on-surface-muted mt-1">Configure automated system triggers and alert rules.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-glass-border">
                  <div>
                    <p className="text-xs font-bold text-on-surface">Email System Notifications</p>
                    <p className="text-[11px] text-on-surface-muted">Receive daily summary digests and system warnings via email.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-glass-border">
                  <div>
                    <p className="text-xs font-bold text-on-surface">Low Stock & Reorder Alerts</p>
                    <p className="text-[11px] text-on-surface-muted">Notify immediately when items fall below reorder thresholds.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={lowStockAlerts}
                    onChange={(e) => setLowStockAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-glass-border">
                  <div>
                    <p className="text-xs font-bold text-on-surface">Price Change Approval Requests</p>
                    <p className="text-[11px] text-on-surface-muted">Alert when a sales rep requests custom pricing override.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={priceApprovalAlerts}
                    onChange={(e) => setPriceApprovalAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-glass-border">
                  <div>
                    <p className="text-xs font-bold text-on-surface">Goods Receiving Verification Updates</p>
                    <p className="text-[11px] text-on-surface-muted">Receive updates on warehouse batch verification status.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={orderStatusAlerts}
                    onChange={(e) => setOrderStatusAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleSavePassword} className="space-y-6">
              <div className="border-b border-glass-border pb-4">
                <h2 className="text-xl font-bold text-on-surface">Security & Password</h2>
                <p className="text-xs text-on-surface-muted mt-1">Update authentication credentials and secure your account.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-muted uppercase mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-elevated border border-glass-border rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-glass-border">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-surface text-xs font-semibold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                >
                  Update Security Password
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;

