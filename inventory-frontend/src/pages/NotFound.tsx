import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-md">
      <h1 className="font-display-lg text-display-lg text-on-surface">404</h1>
      <p className="text-xl font-bold text-on-surface mb-md">Page not found</p>
      <p className="text-sm text-on-surface-muted mb-lg">The route you are trying to access does not exist or you do not have permission.</p>
      <Link to="/login" className="inline-flex items-center gap-sm px-lg py-3 rounded-lg bg-primary text-on-surface hover:bg-primary/90 transition-colors">
        Go to login
      </Link>
    </div>
  );
};

export default NotFound;
