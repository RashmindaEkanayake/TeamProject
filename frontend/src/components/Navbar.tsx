import React from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/api";

interface NavbarProps {
  onOpenSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar }) => {
  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const notificationsPath = isAdmin
    ? "/admin/notifications"
    : "/sales/notifications";

  return (
    <header className="h-16 px-6 bg-surface-elevated/40 backdrop-blur-md border-b border-glass-border flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-xl bg-surface-elevated border border-glass-border text-on-surface"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-on-surface-muted">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span>ATLAS ERP workspace</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to={notificationsPath}
          className="p-2 rounded-xl bg-surface-elevated/80 border border-glass-border text-on-surface-muted hover:text-on-surface hover:bg-outline-variant transition-colors relative"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
        </Link>

        <button
          onClick={authService.logout}
          aria-label="Logout"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold hover:bg-error/20 transition-colors"
          title="Sign out"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
