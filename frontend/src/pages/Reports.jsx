import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  FaChartBar,
  FaDownload,
  FaChevronDown,
  FaCheck,
  FaBuilding,
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaExclamationTriangle,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaTrophy,
  FaClipboardList,
} from 'react-icons/fa';

/* ─── Palette ────────────────────────────────────── */
const CHART_BLUE    = '#3b82f6';
const CHART_EMERALD = '#10b981';
const CHART_AMBER   = '#f59e0b';
const CHART_PURPLE  = '#8b5cf6';
const CHART_INDIGO  = '#6366f1';
const CHART_ROSE    = '#f43f5e';

/* ─── KPI Data ───────────────────────────────────── */
const KPIS = [
  {
    label:    'Total Spend',
    value:    '₹12.4L',
    sub:      '↑ 8.2% vs last month',
    up:       true,
    icon:     FaFileInvoiceDollar,
    accent:   'blue',
    iconBg:   'bg-blue-500/15 border-blue-500/25 text-blue-400',
    badge:    'text-blue-400',
    glow:     'shadow-blue-500/10',
  },
  {
    label:    'Active Vendors',
    value:    '28',
    sub:      '↑ 3 new this month',
    up:       true,
    icon:     FaUsers,
    accent:   'emerald',
    iconBg:   'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    badge:    'text-emerald-400',
    glow:     'shadow-emerald-500/10',
  },
  {
    label:    'PO Fulfillment',
    value:    '94%',
    sub:      '↑ 2% improvement',
    up:       true,
    icon:     FaClipboardList,
    accent:   'purple',
    iconBg:   'bg-purple-500/15 border-purple-500/25 text-purple-400',
    badge:    'text-purple-400',
    glow:     'shadow-purple-500/10',
  },
  {
    label:    'Overdue Invoices',
    value:    '3',
    sub:      '↓ 2 resolved this week',
    up:       false,
    icon:     FaExclamationTriangle,
    accent:   'rose',
    iconBg:   'bg-rose-500/15 border-rose-500/25 text-rose-400',
    badge:    'text-rose-400',
    glow:     'shadow-rose-500/10',
  },
];

/* ─── Monthly Trend Data ─────────────────────────── */
const TREND_DATA = [
  { month: 'Dec', spend: 8.2, pos: 12, rfqs: 8  },
  { month: 'Jan', spend: 9.1, pos: 14, rfqs: 10 },
  { month: 'Feb', spend: 7.8, pos: 11, rfqs: 9  },
  { month: 'Mar', spend: 10.4, pos: 16, rfqs: 13 },
  { month: 'Apr', spend: 11.5, pos: 18, rfqs: 14 },
  { month: 'May', spend: 12.4, pos: 20, rfqs: 16 },
];

/* ─── Category Spend ─────────────────────────────── */
const CATEGORIES = [
  { name: 'IT Hardware',  amount: 4.8, color: CHART_BLUE,    bg: 'bg-blue-500'    },
  { name: 'Furniture',    amount: 3.2, color: CHART_EMERALD, bg: 'bg-emerald-500' },
  { name: 'Logistics',    amount: 2.3, color: CHART_AMBER,   bg: 'bg-amber-500'   },
  { name: 'Stationery',   amount: 2.1, color: CHART_PURPLE,  bg: 'bg-purple-500'  },
];
const TOTAL_CAT = CATEGORIES.reduce((s, c) => s + c.amount, 0);

/* ─── Pie data (for donut) ───────────────────────── */
const PIE_COLORS = [CHART_BLUE, CHART_EMERALD, CHART_AMBER, CHART_PURPLE];

/* ─── Top Vendors ────────────────────────────────── */
const TOP_VENDORS = [
  { rank: 1, name: 'TechCore Ltd',       spend: '₹4,20,000', pos: 6,  pct: 34 },
  { rank: 2, name: 'Infra Supplies',     spend: '₹3,10,000', pos: 4,  pct: 25 },
  { rank: 3, name: 'FastLog Transport',  spend: '₹1,90,000', pos: 3,  pct: 15 },
  { rank: 4, name: 'Prime Tech',         spend: '₹1,45,000', pos: 3,  pct: 12 },
  { rank: 5, name: 'Office Need Co.',    spend: '₹95,000',   pos: 2,  pct: 7  },
];

/* ─── Months ─────────────────────────────────────── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ─── Custom Tooltip ─────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1e293b] border border-white/15 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-semibold mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center space-x-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300">{p.name}:</span>
          <span className="font-bold text-white">
            {p.name === 'spend' ? `₹${p.value}L` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── Component ──────────────────────────────────── */
export default function Reports() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [activeChart, setActiveChart] = useState('area'); // 'area' | 'bar'

  const handleExport = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12 relative">

      {/* ── Export Toast ── */}
      <div className={`fixed top-6 right-6 z-50 flex items-center space-x-3 px-5 py-3.5 bg-emerald-600 text-white rounded-xl shadow-2xl shadow-emerald-500/30 border border-emerald-500/50 transition-all duration-500 ${
        toastVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
          <FaCheck size={13} />
        </div>
        <div>
          <p className="text-sm font-bold">Report exported successfully</p>
          <p className="text-[11px] text-emerald-200">Procurement_Report_{MONTHS[selectedMonth]}_2025.xlsx</p>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FaChartBar size={15} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Reports &amp; Analytics</h2>
          </div>
          <p className="ml-12 text-slate-400 text-sm">
            Procurement Insights ·{' '}
            <span className="text-slate-200 font-semibold">{MONTHS[selectedMonth]} 2025</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Month Selector */}
          <div className="relative">
            <button
              onClick={() => setShowMonthPicker((v) => !v)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-[#1e293b]/60 border border-white/15 hover:border-white/30 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition duration-150"
            >
              <span>{MONTHS[selectedMonth].slice(0, 3)} 2025</span>
              <FaChevronDown size={11} className={`transition-transform duration-200 ${showMonthPicker ? 'rotate-180' : ''}`} />
            </button>
            {showMonthPicker && (
              <div className="absolute right-0 mt-2 w-44 bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl z-30 overflow-hidden">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMonth(i); setShowMonthPicker(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition duration-100 ${
                      i === selectedMonth
                        ? 'bg-blue-600/20 text-blue-400 font-semibold'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-indigo-500/25 transition duration-150 active:scale-[0.98]"
          >
            <FaDownload size={12} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 p-5 shadow-lg ${kpi.glow} hover:border-white/20 hover:scale-[1.01] transition-all duration-200 group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${kpi.iconBg}`}>
                  <Icon size={18} />
                </div>
                <span className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  kpi.up
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {kpi.up ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                  <span>{kpi.sub.split(' ')[0]}</span>
                </span>
              </div>
              <div>
                <span className={`text-3xl font-bold tracking-tight ${kpi.badge}`}>{kpi.value}</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">{kpi.label}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Grid: Trend Chart + Category Spend ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Monthly Trend Chart (spans 2 cols) ── */}
        <div className="xl:col-span-2 bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-5 rounded-full bg-blue-500" />
              <h3 className="text-base font-bold text-white">Monthly Procurement Trend</h3>
            </div>
            {/* Chart type toggle */}
            <div className="flex items-center bg-[#0f172a]/60 border border-white/10 rounded-lg p-0.5">
              {['area', 'bar'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveChart(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition duration-150 ${
                    activeChart === type
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {type === 'area' ? '∿ Area' : '▦ Bar'}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            {activeChart === 'area' ? (
              <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_BLUE}   stopOpacity={0.35} />
                    <stop offset="95%" stopColor={CHART_BLUE}   stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_EMERALD} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_EMERALD} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 4" stroke="#334155" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>}
                />
                <Area
                  type="monotone" dataKey="spend" name="spend"
                  stroke={CHART_BLUE} strokeWidth={2.5}
                  fill="url(#spendGrad)"
                  dot={{ r: 4, fill: CHART_BLUE, strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone" dataKey="pos" name="POs"
                  stroke={CHART_EMERALD} strokeWidth={2}
                  fill="url(#posGrad)"
                  dot={{ r: 3, fill: CHART_EMERALD, strokeWidth: 2, stroke: '#0f172a' }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            ) : (
              <BarChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="#334155" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  formatter={(v) => <span style={{ color: '#94a3b8' }}>{v}</span>}
                />
                <Bar dataKey="spend" name="spend" fill={CHART_BLUE}    radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="pos"   name="POs"   fill={CHART_EMERALD} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            )}
          </ResponsiveContainer>

          {/* Chart legend summary */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-400">Spend (in Lakhs ₹)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400">Purchase Orders count</span>
            </div>
          </div>
        </div>

        {/* ── Spend By Category ── */}
        <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-1.5 h-5 rounded-full bg-purple-500" />
            <h3 className="text-base font-bold text-white">Spend By Category</h3>
          </div>

          {/* Donut mini-chart */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={CATEGORIES}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="amount"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {CATEGORIES.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centre label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-white">₹12.4L</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Total</span>
              </div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="space-y-4">
            {CATEGORIES.map((cat) => {
              const pct = Math.round((cat.amount / TOTAL_CAT) * 100);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${cat.bg}`} />
                      <span className="text-xs font-semibold text-slate-300">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono">₹{cat.amount}L</span>
                      <span className="text-[10px] text-slate-500 w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Grid: Top Vendors + RFQ Breakdown ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Top Vendors Table (2 cols) ── */}
        <div className="xl:col-span-2 bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
              <h3 className="text-base font-bold text-white">Top Vendors By Spend</h3>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">May 2025</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/8 bg-[#0f172a]/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Vendor Name</th>
                  <th className="px-4 py-3 text-right">Spend Amount</th>
                  <th className="px-4 py-3 text-center">Purchase Orders</th>
                  <th className="px-4 py-3">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {TOP_VENDORS.map((v) => (
                  <tr key={v.rank} className="hover:bg-white/[0.025] transition duration-100">
                    <td className="px-4 py-3.5">
                      {v.rank === 1 ? (
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                          <FaTrophy size={10} className="text-amber-400" />
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">{String(v.rank).padStart(2,'0')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0f172a] border border-white/10 flex items-center justify-center">
                          <FaBuilding size={12} className="text-slate-400" />
                        </div>
                        <span className="font-semibold text-white">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-400">{v.spend}</td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                        {v.pos}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 w-32">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            style={{ width: `${v.pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono w-8 text-right">{v.pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Right: RFQ & PO Summary stats ── */}
        <div className="space-y-5">

          {/* RFQ Summary */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-white">RFQ Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total RFQs',    value: 16, color: 'text-white',         sub: 'this month'  },
                { label: 'Avg Vendors',   value: '3.2', color: 'text-blue-400',   sub: 'per RFQ'    },
                { label: 'Avg Response',  value: '4.5d', color: 'text-purple-400', sub: 'to quote'  },
                { label: 'Win Rate',      value: '78%', color: 'text-emerald-400', sub: 'acceptance' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between bg-[#0f172a]/40 border border-white/8 rounded-lg px-3 py-2.5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{stat.label}</span>
                    <span className="text-[10px] text-slate-600">{stat.sub}</span>
                  </div>
                  <span className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance score */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-700/10 border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <h4 className="text-sm font-bold text-white mb-3 relative z-10">Procurement Health</h4>
            <div className="space-y-2 relative z-10">
              {[
                { label: 'Budget Compliance', pct: 92 },
                { label: 'On-time Delivery',  pct: 87 },
                { label: 'Invoice Accuracy',  pct: 96 },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="text-white font-bold">{m.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center relative z-10">
              <span className="text-3xl font-bold text-indigo-300">A+</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Overall Procurement Score</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}