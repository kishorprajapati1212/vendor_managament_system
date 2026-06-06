import { useState, useMemo } from 'react';
import {
  FaHistory,
  FaSearch,
  FaShieldAlt,
  FaLock,
  FaFileInvoice,
  FaCheckSquare,
  FaUserPlus,
  FaFileAlt,
  FaClipboardCheck,
  FaTimesCircle,
  FaUsers,
  FaPaperPlane,
  FaFilter,
  FaInbox,
} from 'react-icons/fa';

/* ─── Activity Data ──────────────────────────── */
const ALL_ACTIVITIES = [
  {
    id: 1,
    category: 'Approvals',
    type: 'approval',
    icon: FaCheckSquare,
    color: 'emerald',
    title: 'Quotation Selected',
    description: 'Infra Supplies selected for Office Furniture Q2 — Grand Total ₹1,85,400',
    date: '21 May 2025',
    time: '11:45 AM',
    user: 'Priya Shah',
  },
  {
    id: 2,
    category: 'Approvals',
    type: 'approval',
    icon: FaClipboardCheck,
    color: 'amber',
    title: 'Approval Pending',
    description: 'Awaiting L2 approval by Priya Shah (Finance Manager)',
    date: '21 May 2025',
    time: '09:00 AM',
    user: 'System',
  },
  {
    id: 3,
    category: 'Approvals',
    type: 'approval',
    icon: FaCheckSquare,
    color: 'emerald',
    title: 'L1 Review Completed',
    description: 'Rahul Mehta (Procurement Head) approved the quotation on May 20',
    date: '20 May 2025',
    time: '10:32 AM',
    user: 'Rahul Mehta',
  },
  {
    id: 4,
    category: 'RFQ',
    type: 'rfq',
    icon: FaPaperPlane,
    color: 'blue',
    title: 'RFQ Published',
    description: 'RFQ "Office Furniture Q2" sent to 3 vendors: Infra Supplies, TechCore, Office Need Co.',
    date: '18 May 2025',
    time: '03:15 PM',
    user: 'Admin',
  },
  {
    id: 5,
    category: 'RFQ',
    type: 'rfq',
    icon: FaFileAlt,
    color: 'indigo',
    title: 'RFQ Created',
    description: 'New RFQ "Office Furniture Q2" created with 2 line items — Ergonomic Chair × 25, Standing Desk × 10',
    date: '17 May 2025',
    time: '02:40 PM',
    user: 'Admin',
  },
  {
    id: 6,
    category: 'Invoices',
    type: 'invoice',
    icon: FaFileInvoice,
    color: 'purple',
    title: 'Invoice Generated',
    description: 'PO-2025-0068 auto-generated after L2 approval. Invoice emailed to vendor.',
    date: '22 May 2025',
    time: '12:00 PM',
    user: 'System',
  },
  {
    id: 7,
    category: 'Invoices',
    type: 'invoice',
    icon: FaCheckSquare,
    color: 'emerald',
    title: 'Payment Received',
    description: 'Invoice PO-2025-0068 marked as paid. Amount: ₹1,85,400 via NEFT.',
    date: '15 June 2025',
    time: '04:22 PM',
    user: 'Finance Team',
  },
  {
    id: 8,
    category: 'Vendors',
    type: 'vendor',
    icon: FaUserPlus,
    color: 'blue',
    title: 'Vendor Added',
    description: 'FastLog Transport registered as an approved vendor under Logistics category',
    date: '10 May 2025',
    time: '11:20 AM',
    user: 'Admin',
  },
  {
    id: 9,
    category: 'Vendors',
    type: 'vendor',
    icon: FaUsers,
    color: 'slate',
    title: 'Vendor Profile Updated',
    description: 'Prime Tech Solutions — contact number and GST number updated',
    date: '08 May 2025',
    time: '09:55 AM',
    user: 'Admin',
  },
  {
    id: 10,
    category: 'Approvals',
    type: 'approval',
    icon: FaTimesCircle,
    color: 'rose',
    title: 'Quotation Rejected',
    description: 'Office Need Co. quotation rejected — price exceeds budget threshold',
    date: '19 May 2025',
    time: '05:10 PM',
    user: 'Rahul Mehta',
  },
  {
    id: 11,
    category: 'RFQ',
    type: 'rfq',
    icon: FaFileAlt,
    color: 'slate',
    title: 'RFQ Closed',
    description: 'Quotation collection period for Office Furniture Q2 closed. 3 bids received.',
    date: '20 May 2025',
    time: '06:00 PM',
    user: 'System',
  },
  {
    id: 12,
    category: 'Vendors',
    type: 'vendor',
    icon: FaUserPlus,
    color: 'indigo',
    title: 'Vendor Onboarded',
    description: 'Infra Supplies Pvt Ltd completed KYC verification and is now active',
    date: '05 May 2025',
    time: '10:00 AM',
    user: 'Admin',
  },
];

const TABS = ['All', 'RFQ', 'Approvals', 'Invoices', 'Vendors'];

/* ─── Color Map ─────────────────────────────── */
const colorMap = {
  emerald: {
    dot:    'bg-emerald-500',
    icon:   'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
    ring:   'ring-emerald-500/20',
    badge:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    line:   'border-emerald-500/30',
  },
  blue: {
    dot:    'bg-blue-500',
    icon:   'bg-blue-500/15 border-blue-500/25 text-blue-400',
    ring:   'ring-blue-500/20',
    badge:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    line:   'border-blue-500/30',
  },
  amber: {
    dot:    'bg-amber-500',
    icon:   'bg-amber-500/15 border-amber-500/25 text-amber-400',
    ring:   'ring-amber-500/20',
    badge:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
    line:   'border-amber-500/30',
  },
  purple: {
    dot:    'bg-purple-500',
    icon:   'bg-purple-500/15 border-purple-500/25 text-purple-400',
    ring:   'ring-purple-500/20',
    badge:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
    line:   'border-purple-500/30',
  },
  indigo: {
    dot:    'bg-indigo-500',
    icon:   'bg-indigo-500/15 border-indigo-500/25 text-indigo-400',
    ring:   'ring-indigo-500/20',
    badge:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    line:   'border-indigo-500/30',
  },
  rose: {
    dot:    'bg-rose-500',
    icon:   'bg-rose-500/15 border-rose-500/25 text-rose-400',
    ring:   'ring-rose-500/20',
    badge:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
    line:   'border-rose-500/30',
  },
  slate: {
    dot:    'bg-slate-500',
    icon:   'bg-slate-500/15 border-slate-500/25 text-slate-400',
    ring:   'ring-slate-500/10',
    badge:  'bg-slate-500/10 text-slate-400 border-slate-500/20',
    line:   'border-slate-500/20',
  },
};

/* ─── Category counts ───────────────────────── */
const catCount = (cat) =>
  cat === 'All'
    ? ALL_ACTIVITIES.length
    : ALL_ACTIVITIES.filter((a) => a.category === cat).length;

/* ─── Component ─────────────────────────────── */
export default function ActivityLogs() {
  const [activeTab, setActiveTab]   = useState('All');
  const [search, setSearch]         = useState('');

  const filtered = useMemo(() => {
    let list = ALL_ACTIVITIES;
    if (activeTab !== 'All') list = list.filter((a) => a.category === activeTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.user.toLowerCase().includes(q) ||
          a.date.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, search]);

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-slate-600/30 border border-white/15 flex items-center justify-center text-slate-300">
              <FaHistory size={15} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Activity &amp; Logs</h2>
          </div>
          <p className="ml-12 text-slate-400 text-sm">Procurement Audit Trail</p>
        </div>

        {/* Immutability badge */}
        <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-500/8 border border-emerald-500/20 rounded-xl shrink-0">
          <FaShieldAlt size={13} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-semibold">Immutable Audit Log</span>
        </div>
      </div>

      {/* ── Search + Filter Row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities, users, dates…"
            className="w-full pl-11 pr-4 py-3 bg-[#1e293b]/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition duration-150 text-xs px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter icon */}
        <button className="flex items-center space-x-2 px-4 py-3 bg-[#1e293b]/50 border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/25 transition duration-150 text-sm font-semibold">
          <FaFilter size={12} />
          <span>Filter</span>
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold border transition duration-150 ${
              activeTab === tab
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/35 shadow'
                : 'bg-[#1e293b]/30 text-slate-400 border-white/8 hover:border-white/20 hover:text-white'
            }`}
          >
            <span>{tab}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-blue-500/30 text-blue-300' : 'bg-white/5 text-slate-500'
            }`}>
              {catCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Main Layout: Timeline + Compliance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Timeline ── */}
        <div className="lg:col-span-3">
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-5 rounded-full bg-blue-500" />
                <h3 className="text-base font-bold text-white">Audit Timeline</h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <FaInbox size={32} className="mb-3 opacity-30" />
                <p className="text-sm font-semibold">No activities found</p>
                <p className="text-xs mt-1">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-white/8 to-transparent" />

                <div className="space-y-1">
                  {filtered.map((activity, idx) => {
                    const c = colorMap[activity.color] || colorMap.slate;
                    const Icon = activity.icon;
                    const isLast = idx === filtered.length - 1;

                    return (
                      <div key={activity.id} className={`relative flex items-start space-x-4 pl-2 ${!isLast ? 'pb-5' : ''}`}>
                        {/* Timeline dot */}
                        <div className="relative z-10 shrink-0 mt-1">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${c.icon} ring-4 ${c.ring}`}>
                            <Icon size={14} />
                          </div>
                          {/* Dot on line */}
                          <div className={`absolute -left-[1.05rem] top-4 w-2 h-2 rounded-full ${c.dot} border-2 border-[#0b0f19]`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 bg-[#0f172a]/40 border border-white/6 hover:border-white/12 rounded-xl px-4 py-3.5 transition duration-150 group">
                          <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="text-sm font-bold text-white">{activity.title}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${c.badge}`}>
                                {activity.category}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 shrink-0">
                              <FaHistory size={9} />
                              <span>{activity.date}</span>
                              <span className="text-slate-600">·</span>
                              <span>{activity.time}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed mb-2">{activity.description}</p>

                          <div className="flex items-center space-x-1.5">
                            <div className="w-4 h-4 rounded bg-slate-700/60 border border-white/10 flex items-center justify-center text-[8px] font-bold text-slate-400">
                              {activity.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">{activity.user}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Stats + Compliance ── */}
        <div className="space-y-5">

          {/* Category Stats */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-slate-400" />
              <h3 className="text-sm font-bold text-white">Category Summary</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'RFQ',       count: catCount('RFQ'),       color: 'bg-blue-500',    text: 'text-blue-400'    },
                { label: 'Approvals', count: catCount('Approvals'), color: 'bg-amber-500',   text: 'text-amber-400'   },
                { label: 'Invoices',  count: catCount('Invoices'),  color: 'bg-purple-500',  text: 'text-purple-400'  },
                { label: 'Vendors',   count: catCount('Vendors'),   color: 'bg-indigo-500',  text: 'text-indigo-400'  },
              ].map((cat) => {
                const pct = Math.round((cat.count / ALL_ACTIVITIES.length) * 100);
                return (
                  <div key={cat.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">{cat.label}</span>
                      <span className={`text-xs font-bold font-mono ${cat.text}`}>{cat.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Compliance Note */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
                <FaLock size={13} className="text-emerald-400" />
              </div>
              <h4 className="text-sm font-bold text-emerald-300">Audit Compliance</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-white font-semibold">Audit logs are immutable.</span>
              {' '}Records are write-once and cannot be edited or deleted. All entries are timestamped and attributed to authenticated users.
            </p>
            <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-emerald-500 font-semibold">
              <FaShieldAlt size={10} />
              <span>ISO 27001 Compliant</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold text-white">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Events', value: ALL_ACTIVITIES.length, color: 'text-white' },
                { label: 'This Month',   value: 9, color: 'text-blue-400' },
                { label: 'Users Active', value: 4, color: 'text-purple-400' },
                { label: 'System Logs',  value: 3, color: 'text-slate-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0f172a]/50 border border-white/8 rounded-lg px-3 py-3 text-center">
                  <span className={`text-xl font-bold font-mono block ${stat.color}`}>{stat.value}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}