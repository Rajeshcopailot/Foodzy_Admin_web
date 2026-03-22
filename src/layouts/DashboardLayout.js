import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth/login', { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onLogout={handleLogout} />
      <main className={`dashboard-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
