import React, { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import useFinanceStore from '../../store/useFinanceStore';

// ── Category color palette ───────────────────────────────────────
const CATEGORY_COLORS = {
  Rent:          '#6366F1',
  Food:          '#10B981',
  Transport:     '#F59E0B',
  Entertainment: '#EC4899',
  Utilities:     '#3B82F6',
  Shopping:      '#8B5CF6',
  Lifestyle:     '#06B6D4',
  Health:        '#EF4444',
  Education:     '#F97316',
  Charity:       '#84CC16',
  Government:    '#A8A29E',
  Investment:    '#4ADE80',
};

const FALLBACK_COLORS = [
  '#6366F1','#10B981','#F59E0B','#EC4899','#3B82F6',
  '#8B5CF6','#06B6D4','#EF4444','#F97316','#84CC16',
];

const getColor = (name, index) =>
  CATEGORY_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];

// ── Data builder ─────────────────────────────────────────────────
const buildSpendingData = (transactions) => {
  const map = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
};

// ── Custom Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const color = CATEGORY_COLORS[name] || FALLBACK_COLORS[0];
  return (
    <div style={{
      background: 'rgba(30,35,64,0.95)',
      border: `1px solid ${color}40`,
      borderRadius: 12,
      padding: '10px 16px',
      backdropFilter: 'blur(12px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ color: '#c2c6d6', fontSize: 12 }}>{name}:</span>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>${value.toLocaleString()}</span>
      </div>
    </div>
  );
};

// ── Component ────────────────────────────────────────────────────
const SpendingDonut = () => {
  const transactions = useFinanceStore((s) => s.transactions);
  const data  = useMemo(() => buildSpendingData(transactions), [transactions]);
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

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
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-ft-muted">Spending Breakdown</p>
        <p className="text-gray-900 dark:text-white font-semibold text-sm mt-0.5">By Category</p>
      </div>

      {/* Chart + center label overlay */}
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={true}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name, index)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label (absolute overlay over the donut hole) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-gray-900 dark:text-white text-lg font-bold leading-tight">
            ${total.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-ft-muted mt-0.5">
            Total Spent
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1">
        {data.map((entry, index) => {
          const color = getColor(entry.name, index);
          const pct   = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={entry.name} className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-[11px] text-ft-muted truncate">{entry.name}</span>
              <span className="text-[11px] text-gray-900 dark:text-white font-semibold ml-auto pl-1">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingDonut;
