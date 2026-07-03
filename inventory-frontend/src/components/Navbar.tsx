import React, { useState, useEffect } from 'react';
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
  const basePrefix = user?.role === 'ADMIN' ? '/admin' : '/sales';

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      setIsLightMode(true);
      document.documentElement.classList.add('light');
    }
  }, []);

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
  };


  const adminAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuB-lqnPyHdln69o1kJoUsQtlDbkX_OBidaqkI2HQxHGvFVoy9c7_K9vD9lmmG1GnWEtq2MlCGjfw1qLq14_6xlTqcmveQz0a-Qnk7lrguJfLKh_VOGmH8_spI8peXvqliWKkjVMMRMum9EPARgXzii9qCDCqRhVg94H0riA-38rA4BpkDLuMcRdkZ-MRAL4LCRWMU7QEWLbR5mvjBfmK0gp1adndFcREaKk_pjmXF-WtVX-pKII5PTx7WKMamC0gFEtGh3NiEtmZ_Y";
  const repAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDx_he0MfXJAz3TFmB_bzbAy7-QMOpzX5wEIHUnlAmf2T-5j2URnuiFntM-t19-ICNos_5ihfHyxYKgGU2_HbBiadNKW5oYwM3er-ZUMnFchJIZWJgD-Uj3iNFk4bwJfez_yb2a0xfzl0eBq3MSFSpXdaXtD-Ukit6D2h2Ie8awAc5DBjE-dCbifmsbe8aNtOEA1jFJ5KszqH_11DdIrg7xV7QqywdQOcxKRmhHFoqYK1AThmmKwI1MhwRMVljLwfgUgky9iwtP4Bw";
  
  const userAvatar = user?.role === 'ADMIN' ? adminAvatar : repAvatar;
  const userRoleText = user?.role === 'ADMIN' ? 'Administrator' : 'Sales Rep';
  const userNameText = user ? `${user.firstName} ${user.lastName}` : 'Guest User';

  return (
    <header className="h-20 fixed top-0 right-0 left-[260px] glass-panel border-t-0 border-l-0 border-r-0 border-b-glass-border flex items-center justify-between px-8 z-20 transition-all">
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
      
      <div className="flex items-center gap-2">
        <button 
          onClick={handleNotificationClick}
          className="relative hover:bg-surface-elevated rounded-xl p-2.5 text-on-surface-muted hover:text-on-surface transition-all group"
        >
          <span className="material-symbols-outlined group-hover:animate-wiggle">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-background animate-pulse"></span>
        </button>
        
        <button 
          onClick={toggleTheme}
          className="hover:bg-surface-elevated rounded-xl p-2.5 text-on-surface-muted hover:text-on-surface transition-all"
          title="Toggle Light/Dark Mode"
        >
          <span className="material-symbols-outlined">{isLightMode ? 'dark_mode' : 'light_mode'}</span>
        </button>
        
        <button className="hover:bg-surface-elevated rounded-xl p-2.5 text-on-surface-muted hover:text-on-surface transition-all">
          <span className="material-symbols-outlined">help</span>
        </button>
        
        <div className="flex items-center gap-4 ml-4 pl-6 border-l border-glass-border cursor-pointer group hover:bg-surface-elevated/50 p-2 rounded-xl transition-all">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-on-surface leading-tight group-hover:text-primary transition-colors">{userNameText}</p>
            <p className="text-[11px] text-secondary font-medium tracking-wide uppercase mt-0.5">{userRoleText}</p>
          </div>
          <div className="relative">
            <img 
              alt="User Avatar" 
              className="w-10 h-10 rounded-xl object-cover border border-outline-variant shadow-sm group-hover:border-primary transition-colors" 
              src={userAvatar}
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-success border-2 border-background rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
