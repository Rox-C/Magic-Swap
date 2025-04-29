import React from 'react';
import SidebarNav from '../components/SidebarNav';
import './MainLayout.css';

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <SidebarNav />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;