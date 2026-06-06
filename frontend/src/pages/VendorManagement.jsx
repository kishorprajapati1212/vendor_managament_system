import { useState, useEffect } from 'react';
import { useVendor } from '../contexts/VendorContext';
import { useActivity } from '../contexts/ActivityContext';
import { addVendor, updateVendor } from '../services/vendorService';
import { 
  FaSearch, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaUserCircle, 
  FaTimes, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaBuilding, 
  FaIdCard 
} from 'react-icons/fa';

export default function VendorManagement() {
  const { vendors, setVendors, fetchVendors } = useVendor();
  const { addLog } = useActivity();

  useEffect(() => {
    fetchVendors();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [viewingVendor, setViewingVendor] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    category: 'Construction',
    gstNumber: '',
    contactNumber: '',
    status: 'Active'
  });

  // Sample data specified in wireframe
  const seedVendors = [
    { id: '1', name: 'ABC Supplies Pvt Ltd', email: 'contact@abc.com', category: 'Construction', gstNumber: '27AABCS1429B2D', contactNumber: '9876543210', status: 'Active' },
    { id: '2', name: 'FastLog Transport', email: 'ship@fastlog.com', category: 'Logistics', gstNumber: '27AABCS1430B2D', contactNumber: '9876543211', status: 'Pending' },
    { id: '3', name: 'Prime Tech Solutions', email: 'info@primetech.com', category: 'IT', gstNumber: '27AABCS1431B2D', contactNumber: '9876543212', status: 'Blocked' }
  ];

  // Merge context vendors avoiding duplicates by name
  const allVendors = [...seedVendors];
  vendors.forEach(v => {
    if (!allVendors.some(sv => sv.name.toLowerCase() === v.name.toLowerCase())) {
      allVendors.push({
        id: v.id.toString(),
        name: v.name,
        email: v.email,
        category: v.category || 'Construction',
        gstNumber: v.gstNumber || '27AABCS1429B2D',
        contactNumber: v.contactNumber || '9876543210',
        status: v.status || 'Active'
      });
    }
  });

  const handleAdd = async (e) => {
    e.preventDefault();
    const payload = {
      name: addForm.name,
      email: addForm.email || `${addForm.name.toLowerCase().replace(/\s+/g, '')}@company.com`,
      category: addForm.category,
      gstNumber: addForm.gstNumber,
      contactNumber: addForm.contactNumber,
      status: addForm.status
    };
    const res = await addVendor(payload);
    setVendors([...vendors, res.data]);
    addLog(`Created Vendor: ${addForm.name}`);
    setIsAddModalOpen(false);
    setAddForm({ name: '', email: '', category: 'Construction', gstNumber: '', contactNumber: '', status: 'Active' });
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const res = await updateVendor(editingVendor.id, editingVendor);
    // Update local context
    setVendors(vendors.map(v => v.id.toString() === editingVendor.id ? res.data : v));
    addLog(`Updated Vendor: ${editingVendor.name}`);
    setIsEditModalOpen(false);
    setEditingVendor(null);
  };

  // Filter calculations
  const totalCount = allVendors.length;
  const activeCount = allVendors.filter(v => v.status === 'Active').length;
  const pendingCount = allVendors.filter(v => v.status === 'Pending').length;
  const blockedCount = allVendors.filter(v => v.status === 'Blocked').length;

  const filteredVendors = allVendors.filter(v => {
    const matchesSearch = 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.gstNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contactNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = 
      selectedFilter === 'All' || 
      v.status === selectedFilter;
      
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Blocked':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Vendors</h2>
          <p className="text-slate-400 mt-1">Manage vendor registrations and supplier information</p>
        </div>
        <div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg hover:shadow-blue-500/10 active:scale-[0.98] transition duration-150 text-sm"
          >
            <FaPlus size={14} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by vendor name, GST number, category..."
          className="w-full pl-12 pr-4 py-3 bg-[#1e293b]/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-150 sm:text-sm"
        />
      </div>

      {/* Filter tabs row */}
      <div className="flex flex-wrap gap-2 pb-2">
        {[
          { key: 'All', label: `All (${totalCount})` },
          { key: 'Active', label: `Active (${activeCount})` },
          { key: 'Pending', label: `Pending (${pendingCount})` },
          { key: 'Blocked', label: `Blocked (${blockedCount})` }
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setSelectedFilter(chip.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide border transition duration-150 ${
              selectedFilter === chip.key
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 shadow'
                : 'bg-[#1e293b]/20 text-slate-400 border-white/5 hover:border-white/25 hover:text-white'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Vendors Table Card */}
      <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm font-semibold">
            No Vendors Found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#0f172a]/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4">Vendor Category</th>
                  <th className="px-6 py-4">GST Number</th>
                  <th className="px-6 py-4">Contact Number</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-850/30 transition duration-100">
                    <td className="px-6 py-4 font-semibold text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center text-slate-500">
                        <FaUserCircle size={18} />
                      </div>
                      <span>{vendor.name}</span>
                    </td>
                    <td className="px-6 py-4">{vendor.category}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{vendor.gstNumber}</td>
                    <td className="px-6 py-4">{vendor.contactNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase ${getStatusBadgeClass(vendor.status)}`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center space-x-2">
                        <button 
                          onClick={() => {
                            setViewingVendor(vendor);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded transition duration-150"
                          title="View Supplier Profile"
                        >
                          <FaEye size={13} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingVendor(vendor);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded transition duration-150"
                          title="Edit Info"
                        >
                          <FaEdit size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* -------------------- POPUP MODALS -------------------- */}

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] w-full max-w-lg border border-white/20 rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-150"
            >
              <FaTimes size={16} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Add New Vendor</h3>
            
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Vendor Name</label>
                <input 
                  type="text" 
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Acme Supplies Pvt Ltd"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  >
                    <option value="Construction" className="bg-[#1e293b]">Construction</option>
                    <option value="Logistics" className="bg-[#1e293b]">Logistics</option>
                    <option value="IT" className="bg-[#1e293b]">IT</option>
                    <option value="Services" className="bg-[#1e293b]">Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  >
                    <option value="Active" className="bg-[#1e293b]">Active</option>
                    <option value="Pending" className="bg-[#1e293b]">Pending</option>
                    <option value="Blocked" className="bg-[#1e293b]">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">GST Number</label>
                <input 
                  type="text" 
                  required
                  value={addForm.gstNumber}
                  onChange={(e) => setAddForm({ ...addForm, gstNumber: e.target.value })}
                  placeholder="e.g. 27AABCS1429B2D"
                  className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    value={addForm.contactNumber}
                    onChange={(e) => setAddForm({ ...addForm, contactNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. contact@supplier.com"
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg active:scale-[0.98] transition duration-150 text-sm"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {isEditModalOpen && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] w-full max-w-lg border border-white/20 rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingVendor(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-150"
            >
              <FaTimes size={16} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Edit Vendor Information</h3>
            
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Vendor Name</label>
                <input 
                  type="text" 
                  required
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={editingVendor.category}
                    onChange={(e) => setEditingVendor({ ...editingVendor, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  >
                    <option value="Construction">Construction</option>
                    <option value="Logistics">Logistics</option>
                    <option value="IT">IT</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={editingVendor.status}
                    onChange={(e) => setEditingVendor({ ...editingVendor, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">GST Number</label>
                <input 
                  type="text" 
                  required
                  value={editingVendor.gstNumber}
                  onChange={(e) => setEditingVendor({ ...editingVendor, gstNumber: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Contact Number</label>
                  <input 
                    type="tel" 
                    required
                    value={editingVendor.contactNumber}
                    onChange={(e) => setEditingVendor({ ...editingVendor, contactNumber: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    type="email" 
                    required
                    value={editingVendor.email}
                    onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 transition duration-150 sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-lg active:scale-[0.98] transition duration-150 text-sm"
                >
                  Update Information
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Supplier Profile Modal */}
      {isViewModalOpen && viewingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] w-full max-w-lg border border-white/20 rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => {
                setIsViewModalOpen(false);
                setViewingVendor(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-150"
            >
              <FaTimes size={16} />
            </button>
            
            {/* Header info */}
            <div className="flex items-center space-x-4 pb-6 border-b border-white/5">
              <div className="w-16 h-16 rounded-full bg-[#0f172a] border border-white/10 flex items-center justify-center text-slate-400">
                <FaUserCircle size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">{viewingVendor.name}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide border uppercase mt-1.5 ${getStatusBadgeClass(viewingVendor.status)}`}>
                  {viewingVendor.status}
                </span>
              </div>
            </div>

            {/* Profile Grid metadata */}
            <div className="py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-[#0f172a]/30 p-3 rounded-lg border border-white/5">
                  <FaBuilding className="text-blue-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Category</span>
                    <span className="text-sm font-semibold text-white">{viewingVendor.category}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-[#0f172a]/30 p-3 rounded-lg border border-white/5">
                  <FaIdCard className="text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">GST Number</span>
                    <span className="text-xs font-mono font-semibold text-white">{viewingVendor.gstNumber}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-[#0f172a]/30 p-3 rounded-lg border border-white/5">
                <FaEnvelope className="text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Email Address</span>
                  <span className="text-sm font-semibold text-white">{viewingVendor.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 bg-[#0f172a]/30 p-3 rounded-lg border border-white/5">
                  <FaPhone className="text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Contact Number</span>
                    <span className="text-sm font-semibold text-white">{viewingVendor.contactNumber}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-[#0f172a]/30 p-3 rounded-lg border border-white/5">
                  <FaMapMarkerAlt className="text-rose-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Location</span>
                    <span className="text-sm font-semibold text-white">Domestic (IN)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button 
                onClick={() => {
                  setIsViewModalOpen(false);
                  setEditingVendor(viewingVendor);
                  setIsEditModalOpen(true);
                  setViewingVendor(null);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg active:scale-[0.98] transition duration-150 text-xs"
              >
                <FaEdit size={12} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}