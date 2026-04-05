import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Wallet,
  Settings,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Transactions', icon: <ArrowLeftRight size={20} />, path: '/transactions' },
    { name: 'Insights', icon: <PieChart size={20} />, path: '/insights' },
  ];

  const bottomItems = [
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { name: 'Help', icon: <HelpCircle size={20} />, path: '/help' },
  ];

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
      isActive
        ? 'bg-indigo-500/15 text-gray-900 dark:text-white shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] border border-ft-primary/30'
        : 'text-ft-muted hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-900 dark:hover:text-white border border-transparent'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-sidebar bg-white dark:bg-[#090E1C] border-r border-gray-200 dark:border-white/10
        transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ft-primary rounded-xl flex items-center justify-center shadow-lg shadow-ft-primary/20 text-white">
                <Wallet size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Finance<span className="text-ft-primary">Dash</span>
              </span>
            </div>
            <button 
              className="lg:hidden text-ft-muted hover:text-gray-900 dark:hover:text-white p-1"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-2 mt-4 scrollbar-hide overflow-y-auto">
            <div className="text-[10px] font-bold text-ft-muted uppercase tracking-widest mb-4 px-4">
              Main Menu
            </div>
            {menuItems.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-ft-primary rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    )}
                    <span className={`transition-all duration-200 ${isActive ? 'text-ft-primary' : 'group-hover:scale-110 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    <span className={`font-medium text-sm ${isActive ? 'text-gray-900 dark:text-white' : ''}`}>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2">
            {bottomItems.map((item) => (
              <NavLink key={item.name} to={item.path} className={navLinkClass}>
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
