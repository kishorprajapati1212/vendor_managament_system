import { useAuth } from '../../contexts/AuthContext';

export default function Topbar() {
  const { user, logout } = useAuth();
  return (
    <header className="bg-[#0f172a] border-b border-white/10 h-16 flex items-center justify-between px-6">
      <h1 className="text-lg font-bold text-white tracking-wide">VendorBridge ERP</h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-slate-300">
          {user?.name || user?.email} ({user?.role || 'Procurement Officer'})
        </span>
        
        {/* User profile avatar on right */}
        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
          <img src="/erp_avatar.png" alt="User Avatar" className="w-full h-full object-cover" />
        </div>

        <button onClick={logout} className="text-sm text-red-400 hover:text-red-300 transition duration-150">
          Logout
        </button>
      </div>
    </header>
  );
}