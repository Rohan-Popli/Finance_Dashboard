import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Insights from './pages/Insights';
import { useEffect } from 'react'
import useFinanceStore from './store/useFinanceStore'
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const darkMode = useFinanceStore((s) => s.darkMode)

  useEffect(() => {
    const root = document.documentElement

    if (darkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [darkMode]);
  return(
    <Router>
      <Toaster position='top-right'/>
      <AppRoutes/>
    </Router>
  );
}


function AppRoutes(){
  const location = useLocation();

  return (
      <AnimatePresence mode = "wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="insights" element={<Insights />} />
            <Route path="*" element={<div className="p-20 text-center font-bold">Page Not Found</div>} />
          </Route>
        </Routes>
      </AnimatePresence>
  );
}

export default App;
