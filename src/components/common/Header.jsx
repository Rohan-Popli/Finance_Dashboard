import React from 'react';
import { Layout, Wallet, PieChart, ArrowLeftRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Header = () => {
  const navItems = [
    { name: 'Dashboard', icon: <Layout className="w-5 h-5" />, path: '/' },
    { name: 'Transactions', icon: <ArrowLeftRight className="w-5 h-5" />, path: '/transactions' },
    { name: 'Insights', icon: <PieChart className="w-5 h-5" />, path: '/insights' },
  ];

  return (
    <header className="bg-primary text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="w-8 h-8 text-accent" />
          <span className="text-xl font-bold tracking-tight">FinanceDash</span>
        </div>
        <nav className="flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 transition-colors hover:text-accent ${
                  isActive ? 'text-accent' : 'text-gray-300'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
