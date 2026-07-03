import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/api';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  const currentUser = authService.getCurrentUser();
  const role = currentUser?.role;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (role === 'SALES_REP') {
      return <Navigate to="/sales/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
