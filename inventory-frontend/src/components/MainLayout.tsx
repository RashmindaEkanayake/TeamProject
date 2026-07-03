import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout: React.FC = () => {
  const token = localStorage.getItem('token');

  // Route guard: if not authenticated, redirect to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md overflow-x-hidden">
      <Sidebar />
      <div className="ml-[260px] min-h-screen flex flex-col transition-all duration-300">
        <Navbar />
        {/* Main Content Area */}
        <main className="flex-1 pt-20 pb-xl px-lg max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
