import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, User, Moon, Sun, ChevronDown, Shield, Eye } from 'lucide-react';
import useFinanceStore from '../../store/useFinanceStore';

// ── Role config ───────────────────────────────────────────────────
const ROLES = {
  admin:  { label: 'Admin',  Icon: Shield, badge: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300 backdrop-blur-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-500/30' },
  viewer: { label: 'Viewer', Icon: Eye,    badge: 'bg-gray-100 text-gray-800 ring-1 ring-gray-300 backdrop-blur-sm dark:bg-white/5 dark:text-gray-300 dark:ring-white/10' },
};

// ── Dark Mode Toggle ──────────────────────────────────────────────
const DarkModeToggle = ({ darkMode, onToggle }) => (
  <button
    id="dark-mode-toggle"
    onClick={onToggle}
    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    className="relative p-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-ft-muted hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
    style={!darkMode ? { boxShadow: '0 0 10px rgba(251,191,36,0.2)' } : {}}
  >
    <span
      className="block transition-all duration-300"
      style={{ transform: darkMode ? 'rotate(0deg)' : 'rotate(180deg)' }}
    >
      {darkMode
        ? <Moon size={16} className="text-indigo-300 group-hover:text-indigo-200" />
        : <Sun  size={16} className="text-amber-300 group-hover:text-amber-200"   />
      }
    </span>
  </button>
);

// ── Role Switcher ─────────────────────────────────────────────────
const RoleSwitcher = ({ role, onSetRole }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = ROLES[role] ?? ROLES.admin;


  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        id="role-switcher-btn"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200 group"
      >
        <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${current.badge}`}>
          <current.Icon size={10} />
          {current.label}
        </span>
        <ChevronDown
          size={13}
          className={`text-ft-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-indigo-500/20 overflow-hidden z-50"
          style={{
            background: 'linear-gradient(135deg, #1e2340 0%, #191e35 60%, #111520 100%)',
            boxShadow: '0 0 0 1px rgba(99,102,241,0.1), 0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Top shimmer */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

          <div className="p-1.5 space-y-0.5">
            {Object.entries(ROLES).map(([key, cfg]) => {
              const isActive = role === key;
              return (
                <button
                  key={key}
                  id={`role-option-${key}`}
                  onClick={() => { onSetRole(key); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-150 group
                    ${isActive
                      ? 'bg-indigo-500/15 text-white'
                      : 'text-ft-muted hover:bg-white/6 hover:text-white'
                    }`}
                >
                  <cfg.Icon size={13} className={isActive ? 'text-indigo-400' : 'text-ft-muted group-hover:text-white'} />
                  <span className="text-xs font-semibold">{cfg.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Navbar ────────────────────────────────────────────────────────
const Navbar = ({ toggleSidebar }) => {
  const darkMode      = useFinanceStore((s) => s.darkMode);
  const toggleDarkMode = useFinanceStore((s) => s.toggleDarkMode);
  const role          = useFinanceStore((s) => s.role);
  const setRole       = useFinanceStore((s) => s.setRole);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  useEffect(() => {
  const handleClickOutside = (e) => {
    if (
      notificationRef.current &&
      !notificationRef.current.contains(e.target)
    ) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-white/5 bg-white/80 dark:bg-[#090e1c]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      {/* Left — hamburger + search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          className="lg:hidden p-2 text-ft-muted hover:text-gray-900 dark:hover:text-white transition-colors"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </button>

        {/* Search Bar */}
        {/* <div className="relative group max-w-md w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ft-muted group-focus-within:text-ft-primary transition-colors duration-200"
            size={16}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-gray-100 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-ft-muted focus:outline-none focus:ring-2 focus:ring-ft-primary/40 focus:border-ft-primary/60 focus:bg-gray-200 dark:focus:bg-white/8 transition-all duration-200"
          />
        </div> */}
      </div>

      {/* Right — controls + profile */}
      <div className="flex items-center gap-2 lg:gap-3">

        {/* Dark Mode Toggle */}
        <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

        {/* Role Switcher */}
        <RoleSwitcher role={role} onSetRole={setRole} />

        {/* Thin separator */}
        <div className="hidden lg:block w-px h-6 bg-gray-200 dark:bg-white/10" />

        {/* Notifications */}
        <div ref = {notificationRef}className="relative">
          {/* 🔔 Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications)}}
            className="relative p-2.5 text-ft-muted hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl group"
          >
            <Bell size={19} />

            {!showNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-ft-primary rounded-full shadow-[0_0_6px_rgba(99,102,241,0.9)] animate-pulse" />
            )}
          </button>

          {/* 🔔 Popup */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg 
            bg-white text-gray-800 border border-gray-200 
            dark:bg-[#1e2340] dark:text-gray-200 dark:border-white/10 
            backdrop-blur-md z-50">

              <div className="text-center py-3">
                <p className="text-lg mb-1">🔔</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You're all caught up!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-3 py-1.5 px-2 lg:px-3 group hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-white/10">
          <div className="hidden lg:block text-right">
            <p className="text-xs font-semibold text-gray-900 dark:text-white group-hover:text-ft-primary transition-colors">Rohan Popli</p>
            <p className="text-[10px] text-ft-muted tracking-wide">Premium Account</p>
          </div>
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
              <User size={16} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#090e1c]" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
