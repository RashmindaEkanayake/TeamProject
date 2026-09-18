import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

interface NavbarProps {
  searchQuery?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery = '', onSearchChange }) => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [isLightMode, setIsLightMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const basePrefix = user?.role === 'ADMIN' ? '/admin' : '/sales';

  // Safe user display name: fullName → firstName+lastName → username → fallback
  const userDisplayName: string = (() => {
    if (!user) return 'Administrator';
    if (user.fullName && user.fullName.trim() && !user.fullName.includes('undefined')) {
      return user.fullName.trim();
    }
    const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (composed && !composed.includes('undefined')) return composed;
    if (user.username) return user.username;
    return 'Administrator';
  })();

  // Avatar initial for fallback
  const avatarInitial = userDisplayName.charAt(0).toUpperCase();

  const userRoleText = user?.role === 'ADMIN' ? 'Administrator' : 'Sales Representative';

  const adminAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-lqnPyHdln69o1kJoUsQtlDbkX_OBidaqkI2HQxHGvFVoy9c7_K9vD9lmmG1GnWEtq2MlCGjfw1qLq14_6xlTqcmveQz0a-Qnk7lrguJfLKh_VOGmH8_spI8peXvqliWKkjVMMRMum9EPARgXzii9qCDCqRhVg94H0riA-38rA4BpkDLuMcRdkZ-MRAL4LCRWMU7QEWLbR5mvjBfmK0gp1adndFcREaKk_pjmXF-WtVX-pKII5PTx7WKMamC0gFEtGh3NiEtmZ_Y';
  const repAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx_he0MfXJAz3TFmB_bzbAy7-QMOpzX5wEIHUnlAmf2T-5j2URnuiFntM-t19-ICNos_5ihfHyxYKgGU2_HbBiadNKW5oYwM3er-ZUMnFchJIZWJgD-Uj3iNFk4bwJfez_yb2a0xfzl0eBq3MSFSpXdaXtD-Ukit6D2h2Ie8awAc5DBjE-dCbifmsbe8aNtOEA1jFJ5KszqH_11DdIrg7xV7QqywdQOcxKRmhHFoqYK1AThmmKwI1MhwRMVljLwfgUgky9iwtP4Bw';
  const userAvatar = user?.role === 'ADMIN' ? adminAvatar : repAvatar;

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const toggleTheme = () => {
    const newTheme = !isLightMode;
    setIsLightMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleNotificationClick = () => {
    navigate(`${basePrefix}/notifications`);
    setDropdownOpen(false);
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    // Navigate to profile if route exists, otherwise stay
    navigate(`${basePrefix}/dashboard`);
  };

  const handleSettingsClick = () => {
    setDropdownOpen(false);
    navigate(`${basePrefix}/dashboard`);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    authService.logout();
  };

  return (
    <header className="h-20 fixed top-0 right-0 left-[260px] glass-panel border-t-0 border-l-0 border-r-0 border-b-glass-border flex items-center justify-between px-8 z-20 transition-all">
      {/* Search Bar */}
      <div className="flex items-center gap-4 w-1/2 max-w-xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-muted group-focus-within:text-primary transition-colors">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            disabled={!onSearchChange}
            className="w-full pl-12 pr-4 py-3 bg-surface-elevated/50 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:bg-surface-elevated transition-all text-sm text-on-surface outline-none placeholder:text-on-surface-muted"
            placeholder="Search inventory, orders, or customers..."
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-2 py-1 bg-surface rounded text-[10px] text-on-surface-muted border border-outline-variant font-sans">Ctrl</kbd>
            <kbd className="px-2 py-1 bg-surface rounded text-[10px] text-on-surface-muted border border-outline-variant font-sans">K</kbd>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={handleNotificationClick}
          className="relative hover:bg-surface-elevated rounded-xl p-2.5 text-on-surface-muted hover:text-on-surface transition-all group"
          title="Notifications"
        >
          <span className="material-symbols-outlined group-hover:animate-wiggle">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse"></span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="hover:bg-surface-elevated rounded-xl p-2.5 text-on-surface-muted hover:text-on-surface transition-all"
          title="Toggle Light/Dark Mode"
        >
          <span className="material-symbols-outlined">{isLightMode ? 'dark_mode' : 'light_mode'}</span>
        </button>

        {/* Help */}
        <button className="hover:bg-surface-elevated rounded-xl p-2.5 text-on-surface-muted hover:text-on-surface transition-all" title="Help">
          <span className="material-symbols-outlined">help</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative ml-4 pl-6 border-l border-glass-border" ref={dropdownRef}>
          <button
            id="user-profile-btn"
            onClick={() => setDropdownOpen(prev => !prev)}
            className="flex items-center gap-3 cursor-pointer group hover:bg-surface-elevated/50 p-2 rounded-xl transition-all"
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            {/* Name + Role (hidden on small screens) */}
            <div className="text-right hidden lg:block">
              <p className="text-sm font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors">
                {userDisplayName}
              </p>
              <p className="text-[11px] text-secondary font-medium tracking-wide uppercase mt-0.5">
                {userRoleText}
              </p>
            </div>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl border border-outline-variant shadow-sm bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-surface font-bold text-base group-hover:border-primary transition-colors">
                {avatarInitial}
              </div>
              {/* Online status dot */}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-background rounded-full" />
            </div>

            {/* Chevron */}
            <span className={`material-symbols-outlined text-on-surface-muted text-base transition-transform duration-200 hidden lg:block ${dropdownOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-64 bg-surface-elevated border border-glass-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-up"
              role="menu"
            >
              {/* User info header */}
              <div className="px-4 py-3 bg-surface/50 border-b border-glass-border">
                <p className="text-sm font-semibold text-on-surface truncate">{userDisplayName}</p>
                <p className="text-xs text-on-surface-muted truncate">{user?.email || user?.username || ''}</p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-success rounded-full inline-block"></span>
                  {userRoleText}
                </span>
              </div>

              {/* Menu items */}
              <div className="py-1.5">
                <button
                  id="dropdown-profile"
                  onClick={handleProfileClick}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-elevated/80 transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-muted group-hover:text-primary transition-colors">account_circle</span>
                  <span>My Profile</span>
                </button>
                <button
                  id="dropdown-settings"
                  onClick={handleSettingsClick}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-elevated/80 transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-muted group-hover:text-primary transition-colors">settings</span>
                  <span>Settings</span>
                </button>
                <button
                  id="dropdown-notifications"
                  onClick={handleNotificationClick}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-elevated/80 transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px] text-on-surface-muted group-hover:text-primary transition-colors">notifications</span>
                  <span>Notifications</span>
                  <span className="ml-auto w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                </button>
              </div>

              {/* Divider + Logout */}
              <div className="border-t border-glass-border py-1.5">
                <button
                  id="dropdown-logout"
                  onClick={handleLogout}
                  role="menuitem"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/10 transition-colors group"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
