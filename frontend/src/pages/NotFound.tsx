import React from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';

const NotFound: React.FC = () => {
  const user = authService.getCurrentUser();
  const homePath = user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'SALES_REP' ? '/sales/dashboard' : '/login';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 animate-fade-in-up">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6">
        <span className="material-symbols-outlined text-5xl">search_off</span>
      </div>
      <h1 className="text-6xl font-extrabold text-on-surface mb-2 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-on-surface mb-2">Page Not Found</h2>
      <p className="text-on-surface-muted text-sm max-w-md mb-8">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link
        to={homePath}
        className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)] inline-flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">home</span>
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
