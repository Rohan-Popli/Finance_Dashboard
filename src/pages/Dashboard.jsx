import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import SpendingDonut from '../components/dashboard/SpendingDonut';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dashboard = () => {
  // Subscribe to transactions so the component re-renders when data changes.
  const transactions = useFinanceStore((s) => s.transactions);
  const getSummary   = useFinanceStore((s) => s.getSummary);
  // Recompute only when transactions change, not on every render.
  const { totalBalance, monthlyIncome, monthlyExpenses } = useMemo(
    () => getSummary(),
    [transactions] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const topCategories = useMemo(() => {
    const expenseMap = {};

    transactions.forEach((t) => {
      if (t.type === 'expense') {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      }
    });

    const sorted = Object.entries(expenseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const total = sorted.reduce((sum, [, val]) => sum + val, 0);

    return sorted.map(([category, amount]) => ({
      category,
      amount,
      percent: total ? (amount / total) * 100 : 0,
    }));
  }, [transactions]);

  return (
    <div className="space-y-6">
      <motion.div {...fadeUp(0)} className="flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ft-muted mb-1">Financial Overview</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Overview</h1>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-indigo-600 to-ft-primary text-white px-5 py-2.5 rounded-xl shadow-lg shadow-ft-primary/30 hover:shadow-ft-primary/50 transition-all duration-300 font-semibold text-sm"
        >
          + Add Expense
        </motion.button>
      </motion.div>
      
      <motion.div {...fadeUp(0.12)} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <motion.div
          whileHover={{ y: -5, boxShadow: '0 0 0 1px rgba(99,102,241,0.25), 0 24px 48px rgba(99,102,241,0.22)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1e2340] via-[#191e35] to-[#111520] p-6 rounded-2xl border border-indigo-500/20 cursor-default group"
          style={{ boxShadow: '0 4px 24px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Total Balance</p>
              <div className="w-9 h-9 bg-indigo-500/15 rounded-xl flex items-center justify-center text-indigo-400 ring-1 ring-indigo-500/20 transition-all duration-300 group-hover:bg-indigo-500/25">
                <Wallet size={17} />
              </div>
            </div>
            <h2 className="text-[2rem] font-bold tracking-tight text-white leading-none">${fmt(totalBalance)}</h2>
            <p className="text-xs text-indigo-400/70 mt-2.5 font-medium">{totalBalance >= 0 ? '↑' : '↓'} Net balance across all transactions</p>
          </div>
        </motion.div>

        {/* Monthly Income Card */}
        <motion.div
          whileHover={{ y: -5, boxShadow: '0 0 0 1px rgba(16,185,129,0.2), 0 24px 48px rgba(16,185,129,0.18)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#182e26] via-[#141f1b] to-[#111520] p-6 rounded-2xl border border-emerald-500/20 cursor-default group"
          style={{ boxShadow: '0 4px 24px rgba(16,185,129,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Monthly Income</p>
              <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-400 ring-1 ring-emerald-500/20 transition-all duration-300 group-hover:bg-emerald-500/25">
                <TrendingUp size={17} />
              </div>
            </div>
            <h2 className="text-[2rem] font-bold tracking-tight text-emerald-300 leading-none">+${fmt(monthlyIncome)}</h2>
            <p className="text-xs text-emerald-400/60 mt-2.5 font-medium">↑ Total income across all periods</p>
          </div>
        </motion.div>

        {/* Monthly Expenses Card */}
        <motion.div
          whileHover={{ y: -5, boxShadow: '0 0 0 1px rgba(239,68,68,0.2), 0 24px 48px rgba(239,68,68,0.16)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#2c1820] via-[#1f1218] to-[#111520] p-6 rounded-2xl border border-red-500/20 cursor-default group"
          style={{ boxShadow: '0 4px 24px rgba(239,68,68,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/8 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Monthly Expenses</p>
              <div className="w-9 h-9 bg-red-500/15 rounded-xl flex items-center justify-center text-red-400 ring-1 ring-red-500/20 transition-all duration-300 group-hover:bg-red-500/25">
                <TrendingDown size={17} />
              </div>
            </div>
            <h2 className="text-[2rem] font-bold tracking-tight text-red-300 leading-none">-${fmt(monthlyExpenses)}</h2>
            <p className="text-xs text-red-400/60 mt-2.5 font-medium">↑ Total expenses across all periods</p>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div {...fadeUp(0.26)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowChart />
        <SpendingDonut />
      </motion.div>
      <motion.div
        {...fadeUp(0.36)}
        className="bg-white dark:bg-ft-card rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Spending Categories
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Top 5 expenses
          </span>
        </div>

        <div className="space-y-4">
          {topCategories.map((item) => (
            <div key={item.category}>
              {/* Row */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ${fmt(item.amount)} • {item.percent.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
