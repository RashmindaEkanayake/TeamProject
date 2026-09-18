import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

interface SidebarProps {
  onNewTransactionClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNewTransactionClick }) => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    authService.logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    const baseClass = "flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-xl group";
    const activeClass = "text-on-surface font-medium bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
    const inactiveClass = "text-on-surface-muted hover:text-on-surface hover:bg-surface-elevated border border-transparent";
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  const basePrefix = isAdmin ? "/admin" : "/sales";
  const dashboardPath = `${basePrefix}/dashboard`;

  return (
    <aside className="w-[260px] h-screen fixed left-0 top-0 glass-panel border-r-0 border-r-glass-border flex flex-col py-6 px-4 z-30" id="sidebar">
      <div className="mb-8 px-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-on-surface text-xl">data_exploration</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight leading-none">Nexus ERP</h1>
          <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest mt-1">Enterprise</p>
        </div>
      </div>

      <button
        onClick={onNewTransactionClick || (() => navigate(`${basePrefix}/orders`))}
        className="mb-8 w-full bg-primary text-on-surface font-medium py-3 px-4 flex items-center justify-center gap-2 rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] group"
      >
        <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">add</span>
        New Transaction
      </button>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        <NavLink to={dashboardPath} className={navLinkClass}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-sm">Dashboard</span>
        </NavLink>

        {/* Inventory — Admin only */}
        {isAdmin && (
          <NavLink to={`${basePrefix}/inventory`} className={navLinkClass}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-sm">Inventory</span>
          </NavLink>
        )}

        {/* Receiving — Admin only */}
        {isAdmin && (
          <NavLink to={`${basePrefix}/goods-receiving`} className={navLinkClass}>
            <span className="material-symbols-outlined">input</span>
            <span className="text-sm">Receiving</span>
          </NavLink>
        )}

        {/* Orders — visible to all */}
        <NavLink to={`${basePrefix}/orders`} className={navLinkClass}>
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="text-sm">Orders</span>
        </NavLink>

        {/* Customers — visible to all */}
        <NavLink to={`${basePrefix}/customers`} className={navLinkClass}>
          <span className="material-symbols-outlined">group</span>
          <span className="text-sm">Customers</span>
        </NavLink>

        {/* Suppliers — Admin only */}
        {isAdmin && (
          <NavLink to={`${basePrefix}/suppliers`} className={navLinkClass}>
            <span className="material-symbols-outlined">local_shipping</span>
            <span className="text-sm">Suppliers</span>
          </NavLink>
        )}

        {/* Sales Reps — Admin only */}
        {isAdmin && (
          <NavLink to={`${basePrefix}/sales-reps`} className={navLinkClass}>
            <span className="material-symbols-outlined">badge</span>
            <span className="text-sm">Sales Reps</span>
          </NavLink>
        )}

        {/* Pricing — Admin only */}
        {isAdmin && (
          <NavLink to={`${basePrefix}/price-approvals`} className={navLinkClass}>
            <span className="material-symbols-outlined">payments</span>
            <span className="text-sm">Pricing</span>
          </NavLink>
        )}

        {/* Notifications — visible to all */}
        <NavLink to={`${basePrefix}/notifications`} className={navLinkClass}>
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-sm">Notifications</span>
        </NavLink>

        {/* Analytics / Reports — Admin only */}
        {isAdmin && (
          <NavLink to={`${basePrefix}/reports`} className={navLinkClass}>
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm">Analytics</span>
          </NavLink>
        )}
      </nav>

      <div className="pt-6 mt-4 border-t border-glass-border space-y-2">
        <NavLink to={`${basePrefix}/settings`} className={navLinkClass}>
          <span className="material-symbols-outlined group-hover:rotate-45 transition-transform duration-300">settings</span>
          <span className="text-sm">Settings</span>
        </NavLink>
        <a href="#logout" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all duration-300 rounded-xl group">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-sm font-medium">Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
