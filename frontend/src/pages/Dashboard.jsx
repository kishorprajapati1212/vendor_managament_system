import { Link } from 'react-router-dom';
import { 
  FaPlus, 
  FaUserPlus, 
  FaFileInvoiceDollar, 
  FaFileAlt, 
  FaTasks, 
  FaExclamationTriangle, 
  FaChevronRight 
} from 'react-icons/fa';

export default function Dashboard() {
  const kpis = [
    { title: 'Active RFQs', value: '12', description: 'RFQs receiving bids', icon: <FaFileAlt className="text-blue-400" /> },
    { title: 'Pending Approvals', value: '5', description: 'Awaiting your review', icon: <FaTasks className="text-amber-400" /> },
    { title: 'PO Value This Month', value: '$2.3L', description: 'Month-to-date spent', icon: <FaFileInvoiceDollar className="text-emerald-400" /> },
    { title: 'Overdue Invoices', value: '3', description: 'Past payment terms', icon: <FaExclamationTriangle className="text-rose-400" /> }
  ];

  const recentPOs = [
    { id: 'PO-2026-001', vendor: 'Acme Corp', amount: '$12,500', status: 'Approved', statusClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: 'PO-2026-002', vendor: 'Globex Inc', amount: '$8,200', status: 'Pending', statusClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { id: 'PO-2026-003', vendor: 'Stark Industries', amount: '$45,000', status: 'Draft', statusClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
    { id: 'PO-2026-004', vendor: 'Wayne Enterprises', amount: '$23,400', status: 'Rejected', statusClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    { id: 'PO-2026-005', vendor: 'Umbrella Corp', amount: '$15,800', status: 'Approved', statusClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard</h2>
        <p className="text-slate-400 mt-1">Welcome back, Procurement Officer</p>
      </div>

      {/* KPI Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-[#1e293b]/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg flex items-center justify-between hover:border-white/20 transition duration-150">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {kpi.title}
              </span>
              <span className="text-3xl font-bold text-white mt-2 block">
                {kpi.value}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {kpi.description}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-[#0f172a] border border-white/5 flex items-center justify-center text-xl">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Charts & Recent activity */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Spending Trends Widget */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Spending Trends (Last 6 Months)</h3>
            
            {/* Custom SVG Line Area Chart */}
            <div className="h-64 relative flex items-end">
              <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-axis gridlines */}
                <line x1="0" y1="40" x2="600" y2="40" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="100" x2="600" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="160" x2="600" y2="160" stroke="#334155" strokeWidth="1" strokeDasharray="4" />

                {/* Area Gradient */}
                <path 
                  d="M0,190 L100,160 L200,175 L300,130 L400,110 L500,80 L600,60 L600,200 L0,200 Z" 
                  fill="url(#chartGlow)"
                />

                {/* Line Path */}
                <path 
                  d="M0,190 L100,160 L200,175 L300,130 L400,110 L500,80 L600,60" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Chart Dots & Glows */}
                <circle cx="100" cy="160" r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <circle cx="200" cy="175" r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <circle cx="300" cy="130" r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <circle cx="400" cy="110" r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <circle cx="500" cy="80" r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <circle cx="600" cy="60" r="5" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              </svg>

              {/* X Axis Labels */}
              <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-slate-500 px-2">
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>
          </div>

          {/* Recent Purchase Orders Table */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Recent Purchase Orders</h3>
              <Link to="/pos" className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1 transition duration-150">
                <span>View All</span>
                <FaChevronRight size={10} />
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3">PO Number</th>
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {recentPOs.map((po, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/20 transition duration-100">
                      <td className="py-3 font-semibold text-white">{po.id}</td>
                      <td className="py-3 text-slate-300">{po.vendor}</td>
                      <td className="py-3 font-semibold text-white">{po.amount}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase ${po.statusClass}`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Quick Actions & Navigation summary */}
        <div className="space-y-8">
          
          {/* Quick Actions Widget */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            <div className="space-y-4">
              <Link 
                to="/rfqs" 
                className="w-full flex items-center justify-between p-4 bg-[#0f172a]/40 hover:bg-blue-600/10 border border-white/10 hover:border-blue-500/30 rounded-xl transition duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <FaPlus />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition duration-150 block">New RFQ</span>
                    <span className="text-xs text-slate-500">Initiate source request</span>
                  </div>
                </div>
                <FaChevronRight className="text-slate-600 group-hover:text-blue-400 transition duration-150" size={12} />
              </Link>

              <Link 
                to="/vendors" 
                className="w-full flex items-center justify-between p-4 bg-[#0f172a]/40 hover:bg-purple-600/10 border border-white/10 hover:border-purple-500/30 rounded-xl transition duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <FaUserPlus />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white group-hover:text-purple-400 transition duration-150 block">Add Vendor</span>
                    <span className="text-xs text-slate-500">Register new enterprise supplier</span>
                  </div>
                </div>
                <FaChevronRight className="text-slate-600 group-hover:text-purple-400 transition duration-150" size={12} />
              </Link>

              <Link 
                to="/invoices" 
                className="w-full flex items-center justify-between p-4 bg-[#0f172a]/40 hover:bg-emerald-600/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FaFileInvoiceDollar />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition duration-150 block">View Invoices</span>
                    <span className="text-xs text-slate-500">Analyze accounts payable invoices</span>
                  </div>
                </div>
                <FaChevronRight className="text-slate-600 group-hover:text-emerald-400 transition duration-150" size={12} />
              </Link>
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
            <h4 className="text-sm font-bold text-white mb-2">Hackathon Presentation Ready</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All backend endpoints have been successfully mocked with robust offline recovery. The application runs presentation-ready out of the box with zero external dependencies.
            </p>
            <div className="w-full bg-blue-600 text-center py-2 rounded-lg text-xs font-semibold text-white shadow-md">
              System Online (Local Mocked)
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}