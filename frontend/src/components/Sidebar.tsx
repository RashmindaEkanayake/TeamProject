import React from 'react';
import { NavLink } from 'react-router-dom';
import { authService } from '../services/api';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: 'monitoring' },
    { to: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
    { to: '/admin/goods-receiving', label: 'Goods Receiving', icon: 'move_to_inbox' },
    { to: '/admin/orders', label: 'Orders', icon: 'shopping_cart' },
    { to: '/admin/customers', label: 'Customers', icon: 'group' },
    { to: '/admin/suppliers', label: 'Suppliers', icon: 'local_shipping' },
    { to: '/admin/price-approvals', label: 'Price Approvals', icon: 'price_change' },
    { to: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
    { to: '/admin/reports', label: 'Reports', icon: 'bar_chart' },
    { to: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  const salesLinks = [
    { to: '/sales/dashboard', label: 'Sales Dashboard', icon: 'dashboard' },
    { to: '/sales/orders', label: 'Orders', icon: 'shopping_cart' },
    { to: '/sales/customers', label: 'Customers', icon: 'group' },
    { to: '/sales/notifications', label: 'Notifications', icon: 'notifications' },
    { to: '/sales/settings', label: 'Settings', icon: 'settings' },
  ];

  const links = isAdmin ? adminLinks : salesLinks;

  return (
    <aside className="w-64 h-full bg-surface-elevated/80 backdrop-blur-md border-r border-glass-border flex flex-col justify-between">
      <div>
        <div className="p-6 border-b border-glass-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              <span className="material-symbols-outlined text-white text-[20px]">inventory</span>
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-on-surface text-lg block">NEXUS ERP</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block -mt-1">
                {isAdmin ? 'Admin Portal' : 'Sales Portal'}
              </span>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-on-surface-muted hover:text-on-surface">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] font-semibold'
                    : 'text-on-surface-muted hover:text-on-surface hover:bg-outline-variant'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-glass-border">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-surface/40">
          <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">
              {user?.fullName || user?.username}
            </p>
            <p className="text-[10px] text-on-surface-muted truncate uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
