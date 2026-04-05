import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import useFinanceStore from '../../store/useFinanceStore';

// ── Custom Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'rgba(30,35,64,0.92)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 12,
        padding: '10px 16px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <p style={{ color: '#9CA3AF', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ color: '#c2c6d6', fontSize: 12, textTransform: 'capitalize' }}>{entry.name}:</span>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>
            ${entry.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Month grouping helper ────────────────────────────────────────
const MONTH_ORDER = ['Jan 2025', 'Feb 2025', 'Mar 2025'];

const buildCashFlowData = (transactions) => {
  const map = {};
  MONTH_ORDER.forEach((m) => { map[m] = { month: m, income: 0, expense: 0 }; });

  transactions.forEach((t) => {
    const d = new Date(t.date + 'T00:00:00');
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (map[key]) {
      if (t.type === 'income')  map[key].income  += t.amount;
      else                      map[key].expense += t.amount;
    }
  });

  return MONTH_ORDER.map((m) => ({
    month: m.split(' ')[0], // "Jan", "Feb", "Mar"
    income:  Math.round(map[m].income),
    expense: Math.round(map[m].expense),
  }));
};

// ── Component ────────────────────────────────────────────────────
const CashFlowChart = () => {
  const transactions = useFinanceStore((s) => s.transactions);
  const data = useMemo(() => buildCashFlowData(transactions), [transactions]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-indigo-500/15 p-6 flex flex-col gap-4"
      style={{
        background: 'var(--glass-card-bg, linear-gradient(135deg, #1e2340 0%, #191e35 50%, #111520 100%))',
        boxShadow: '0 0 0 1px rgba(99,102,241,0.08), 0 8px 40px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Monthly Cash Flow</p>
          <p className="text-gray-900 dark:text-white font-semibold text-sm mt-0.5">Income vs Expenses</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-ft-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-ft-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Expense
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.2)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#gradIncome)"
              dot={false}
              activeDot={{ r: 5, fill: '#10B981', stroke: '#0A0F1E', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#gradExpense)"
              dot={false}
              activeDot={{ r: 5, fill: '#EF4444', stroke: '#0A0F1E', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CashFlowChart;
