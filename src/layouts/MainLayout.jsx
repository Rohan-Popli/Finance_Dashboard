import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#0A0F1E] font-sans overflow-hidden">
      {/* Sidebar for navigation */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0F1E]">
        <Navbar toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 bg-gray-50 dark:bg-[#0A0F1E]">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

        <footer className="py-4 px-8 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#090E1C] text-center text-[10px] uppercase tracking-widest text-ft-muted">
          &copy; {new Date().getFullYear()} FinanceDash &bull; High-End Editorial Finance Architecture
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
