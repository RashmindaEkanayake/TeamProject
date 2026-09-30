import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/api';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user's role is not permitted, redirect to their role's home
    const target = user.role === 'ADMIN' ? '/admin/dashboard' : '/sales/dashboard';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
