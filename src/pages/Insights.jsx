import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  Tag, CalendarDays, TrendingDown, Hash,
  AlertCircle, CheckCircle2, Info, Lightbulb,
} from 'lucide-react';
import useFinanceStore from '../store/useFinanceStore';

// ─────────────────────────────────────────────
// Shared animation helper
// ─────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.42, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

// ─────────────────────────────────────────────
// Shared card wrapper  (matches Dashboard cards)
// ─────────────────────────────────────────────
const GlassCard = ({ children, className = '', accentColor = 'rgba(99,102,241,0.15)' }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-indigo-500/15 bg-white dark:bg-transparent ${className}`}
    style={{
      background: 'var(--glass-card-bg, linear-gradient(135deg, #1e2340 0%, #191e35 50%, #111520 100%))',
      boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 8px 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
    }}
  >
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Shared custom tooltip
// ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(30,35,64,0.95)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 12,
      padding: '10px 16px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#c2c6d6', fontSize: 12, textTransform: 'capitalize' }}>{entry.name}:</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
            ${Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// Data computation hook
// ─────────────────────────────────────────────
const MONTH_KEYS   = ['Jan 2025', 'Feb 2025', 'Mar 2025'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar'];

const useInsightsData = (transactions) =>
  useMemo(() => {
    // ── Per-month income / expense
    const monthMap = {};
    MONTH_KEYS.forEach((k) => { monthMap[k] = { income: 0, expense: 0 }; });

    transactions.forEach((t) => {
      const key = new Date(t.date + 'T00:00:00')
        .toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthMap[key]) return;
      if (t.type === 'income') monthMap[key].income  += t.amount;
      else                     monthMap[key].expense += t.amount;
    });

    const monthlyData = MONTH_KEYS.map((k, i) => ({
      month:   MONTH_LABELS[i],
      income:  Math.round(monthMap[k].income),
      expense: Math.round(monthMap[k].expense),
    }));

    // ── Category totals (expenses only)
    const catMap = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });

    const sortedCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const topCat     = sortedCats[0]?.[0] ?? '—';
    const topCatAmt  = Math.round(sortedCats[0]?.[1] ?? 0);
    const totalExpenses = Object.values(catMap).reduce((s, v) => s + v, 0);
    const topCatPct  = totalExpenses > 0 ? Math.round((topCatAmt / totalExpenses) * 100) : 0;

    // ── Best saving month (lowest expense)
    const bestMonth = MONTH_KEYS.reduce((best, k) =>
      monthMap[k].expense < monthMap[best].expense ? k : best, MONTH_KEYS[0]);
    const bestMonthLabel = bestMonth.split(' ')[0] + ' ' + bestMonth.split(' ')[1];

    // ── Average monthly spend
    const totalExpAll = monthlyData.reduce((s, d) => s + d.expense, 0);
    const avgMonthlySpend = Math.round(totalExpAll / monthlyData.length);

    // ── Total transactions
    const totalTxns = transactions.length;

    // ── Savings rate per month (income - expense) / income
    const savingsRates = monthlyData.map((d) =>
      d.income > 0 ? Math.round(((d.income - d.expense) / d.income) * 100) : 0
    );
    const avgSavingsRate  = Math.round(savingsRates.reduce((s, r) => s + r, 0) / savingsRates.length);
    const bestSavingsRate = Math.max(...savingsRates);

    // ── Spending trend (expense per month as line)
    const trendData = monthlyData.map((d) => ({ month: d.month, expense: d.expense }));

    // ── Month-over-month expense change (last vs prev)
    const lastExpense  = monthlyData[monthlyData.length - 1].expense;
    const prevExpense  = monthlyData[monthlyData.length - 2].expense;
    const expChangePct = prevExpense > 0
      ? Math.round(((lastExpense - prevExpense) / prevExpense) * 100)
      : 0;

    return {
      monthlyData, trendData,
      topCat, topCatPct,
      bestMonthLabel,
      avgMonthlySpend,
      totalTxns,
      avgSavingsRate, bestSavingsRate,
      expChangePct, lastExpense, prevExpense,
    };
  }, [transactions]);

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconColor, iconBg, label, value, sub, delay }) => (
  <motion.div {...fadeUp(delay)}>
    <GlassCard className="p-5 group cursor-default h-full">
      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ft-muted">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ring-1 transition-all duration-300 ${iconBg} ${iconColor}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">{value}</p>
      <p className="text-[11px] text-ft-muted mt-2 font-medium">{sub}</p>
    </GlassCard>
  </motion.div>
);

// ─────────────────────────────────────────────
// Smart Insight Row
// ─────────────────────────────────────────────
const SENTIMENT = {
  warn:    { Icon: AlertCircle,   border: 'border-l-amber-400',   bg: 'bg-amber-400/10',   text: 'text-amber-300',   ring: 'ring-amber-400/25' },
  good:    { Icon: CheckCircle2,  border: 'border-l-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-300', ring: 'ring-emerald-400/25' },
  info:    { Icon: Info,          border: 'border-l-blue-400',    bg: 'bg-blue-400/10',    text: 'text-blue-300',    ring: 'ring-blue-400/25' },
  idea:    { Icon: Lightbulb,     border: 'border-l-violet-400',  bg: 'bg-violet-400/10',  text: 'text-violet-300',  ring: 'ring-violet-400/25' },
};

const InsightRow = ({ type, message, delay }) => {
  const styleMap = {
    warn: `text-amber-600 dark:text-amber-400 bg-amber-50/40 dark:bg-amber-500/5`,
    good: `text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-500/5`,
    idea: `text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-500/5`,
    info: `text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-500/5`,
  };

  const style = styleMap[type] || styleMap.info;

  return (
    <motion.div
      {...fadeUp(delay)}
      className={`rounded-xl px-4 py-3 text-sm transition-all duration-200 ${style}`}
    >
      {message}
    </motion.div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const Insights = () => {
  const transactions = useFinanceStore((s) => s.transactions);
  const {
    monthlyData, trendData,
    topCat, topCatPct,
    bestMonthLabel,
    avgMonthlySpend,
    totalTxns,
    avgSavingsRate,
    expChangePct,
  } = useInsightsData(transactions);

  // Build smart insight messages dynamically
  const insights = useMemo(() => {
    const list = [];

    // Top spending category
    list.push({
      type: topCatPct >= 30 ? 'warn' : 'info',
      message: `Your highest spending category is ${topCat}, making up ${topCatPct}% of total expenses. ${topCatPct >= 30 ? 'Consider reviewing this spend.' : 'This is within a healthy range.'}`,
    });

    // Month-over-month expense change
    if (expChangePct !== 0) {
      list.push({
        type: expChangePct > 0 ? 'warn' : 'good',
        message: expChangePct > 0
          ? `Expenses increased by ${expChangePct}% in the most recent month compared to the previous month. Keep an eye on discretionary spend.`
          : `Great progress! Expenses dropped by ${Math.abs(expChangePct)}% compared to the previous month.`,
      });
    }

    // Savings rate
    list.push({
      type: avgSavingsRate >= 20 ? 'good' : avgSavingsRate >= 10 ? 'info' : 'warn',
      message: avgSavingsRate >= 20
        ? `Excellent saving habit! Your average savings rate is ${avgSavingsRate}% across all months.`
        : avgSavingsRate >= 10
          ? `Your average savings rate is ${avgSavingsRate}%. Aim for 20% or above for stronger financial health.`
          : `Your savings rate is ${avgSavingsRate}%, which is below the recommended 20%. Look for expense reduction opportunities.`,
    });

    // Best saving month
    list.push({
      type: 'idea',
      message: `${bestMonthLabel} was your best saving month — try to replicate those spending habits to hit your long-term goals.`,
    });

    return list;
  }, [topCat, topCatPct, expChangePct, avgSavingsRate, bestMonthLabel]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* ── Page Header ── */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted mb-1">Analytics</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Financial Insights</h1>
        </div>
        <div className="text-[11px] text-ft-muted font-medium uppercase tracking-widest">
          Jan – Mar 2025
        </div>
      </motion.div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          delay={0.08}
          icon={Tag}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15 ring-violet-500/20 group-hover:bg-violet-500/25"
          label="Top Category"
          value={topCat}
          sub={`${topCatPct}% of total spend`}
        />
        <StatCard
          delay={0.14}
          icon={CalendarDays}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/15 ring-emerald-500/20 group-hover:bg-emerald-500/25"
          label="Best Saving Month"
          value={bestMonthLabel}
          sub="Lowest expense month"
        />
        <StatCard
          delay={0.20}
          icon={TrendingDown}
          iconColor="text-red-400"
          iconBg="bg-red-500/15 ring-red-500/20 group-hover:bg-red-500/25"
          label="Avg Monthly Spend"
          value={`$${avgMonthlySpend.toLocaleString()}`}
          sub="3-month average"
        />
        <StatCard
          delay={0.26}
          icon={Hash}
          iconColor="text-indigo-400"
          iconBg="bg-indigo-500/15 ring-indigo-500/20 group-hover:bg-indigo-500/25"
          label="Total Transactions"
          value={totalTxns}
          sub="All time"
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Income vs Expense */}
        <motion.div {...fadeUp(0.32)}>
          <GlassCard className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Monthly Comparison</p>
                <p className="text-gray-900 dark:text-white font-semibold text-sm mt-0.5">Income vs Expenses</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-ft-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Income
                </span>
                <span className="flex items-center gap-1.5 text-ft-muted">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Expense
                </span>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 6, right: 4, left: -10, bottom: 0 }} barGap={4} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                  <Bar dataKey="income"  fill="#10B981" radius={[5, 5, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expense" fill="#EF4444" radius={[5, 5, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Line Chart — Spending Trend */}
        <motion.div {...fadeUp(0.38)}>
          <GlassCard className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Spending Trend</p>
              <p className="text-gray-900 dark:text-white font-semibold text-sm mt-0.5">Monthly Expense Trajectory</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 6, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(239,68,68,0.3)', strokeWidth: 1 }} />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#EF4444', stroke: '#0A0F1E', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#EF4444', stroke: '#0A0F1E', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Smart Insights ── */}
      <motion.div {...fadeUp(0.44)}>
        <GlassCard className="p-6">
          <div className="mb-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Smart Insights</p>
            <p className="text-gray-900 dark:text-white font-semibold text-sm mt-0.5">AI-powered observations from your data</p>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <InsightRow key={i} type={ins.type} message={ins.message} delay={0.48 + i * 0.06} />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};

export default Insights;
