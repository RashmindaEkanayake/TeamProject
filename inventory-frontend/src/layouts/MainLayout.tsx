import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout: React.FC = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans overflow-x-hidden relative">
      {/* Subtle global background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <Sidebar />
      <div className="ml-[260px] min-h-screen flex flex-col transition-all duration-300 relative z-10">
        <Navbar />
        <main className="flex-1 pt-24 pb-xl px-lg max-w-[1440px] w-full mx-auto animate-fade-in-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
