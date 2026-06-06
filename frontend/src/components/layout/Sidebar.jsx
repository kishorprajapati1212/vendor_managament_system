import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaUsers, 
  FaFileInvoice, 
  FaListUl, 
  FaCheckSquare, 
  FaMoneyBillWave, 
  FaChartBar, 
  FaHistory 
} from 'react-icons/fa';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <FaHome /> },
    { name: 'Vendors', path: '/vendors', icon: <FaUsers /> },
    { name: 'RFQs', path: '/rfqs', icon: <FaFileInvoice /> },
    { name: 'Quotations', path: '/quotations', icon: <FaListUl /> },
    { name: 'Approvals', path: '/workflow', icon: <FaCheckSquare /> },
    { name: 'Purchase Orders', path: '/pos', icon: <FaFileInvoice /> },
    { name: 'Invoices', path: '/invoices', icon: <FaMoneyBillWave /> },
    { name: 'Reports', path: '/reports', icon: <FaChartBar /> },
    { name: 'Activity', path: '/logs', icon: <FaHistory /> },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-white/10 text-slate-300 h-screen flex flex-col overflow-y-auto">
      <div className="p-6 text-2xl font-bold tracking-wider text-white border-b border-white/10">
        VendorBridge
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}