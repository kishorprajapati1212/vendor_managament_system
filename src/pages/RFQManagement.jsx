import { useState, useRef, useEffect } from 'react';
import { useVendor } from '../contexts/VendorContext';
import { createRFQ, publishRFQ } from '../services/rfqService';
import {
  FaFileInvoice,
  FaPlus,
  FaTimes,
  FaCloudUploadAlt,
  FaTrash,
  FaBuilding,
  FaCheck,
  FaChevronRight,
  FaSave,
  FaPaperPlane,
  FaBoxOpen,
  FaUsers,
  FaSearch,
} from 'react-icons/fa';

/* ─────────────────────────────────────────────
   Step Indicator
───────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Basic Details' },
  { id: 2, label: 'Items & Vendors' },
  { id: 3, label: 'Review & Publish' },
];

function StepIndicator({ activeStep }) {
  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, idx) => {
        const isCompleted = activeStep > step.id;
        const isActive = activeStep === step.id;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : isActive
                    ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10'
                    : 'bg-[#0f172a] border-white/10 text-slate-500'
                }`}
              >
                {isCompleted ? <FaCheck size={12} /> : step.id}
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                  isActive ? 'text-blue-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 mb-5 transition-all duration-300 ${
                  isCompleted ? 'bg-blue-600' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Shared Input / Label helpers
───────────────────────────────────────────── */
const inputCls =
  'w-full px-4 py-2.5 bg-[#0f172a]/60 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150 text-sm';

const labelCls =
  'block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5';

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function RFQManagement() {
  const [activeStep, setActiveStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  /* Form state */
  const [form, setForm] = useState({
    title: '',
    category: '',
    deadline: '',
    description: '',
  });

  /* Line items */
  const [lineItems, setLineItems] = useState([
    { id: 1, name: 'Ergonomic Chair', quantity: 25, unit: 'NOS' },
    { id: 2, name: 'Standing Desk', quantity: 10, unit: 'NOS' },
  ]);
  const [showLineItemForm, setShowLineItemForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: '', unit: 'NOS' });

  /* Vendors from context */
  const { vendors, fetchVendors } = useVendor();
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [showVendorSearch, setShowVendorSearch] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(vendorSearch.toLowerCase()) &&
      !assignedVendors.some((av) => av.id === v.id)
  );

  /* ── Handlers ── */
  const addLineItem = () => {
    if (!newItem.name || !newItem.quantity) return;
    setLineItems([...lineItems, { id: Date.now(), ...newItem, quantity: Number(newItem.quantity) }]);
    setNewItem({ name: '', quantity: '', unit: 'NOS' });
    setShowLineItemForm(false);
  };

  const removeLineItem = (id) => setLineItems(lineItems.filter((i) => i.id !== id));

  const addVendor = (v) => {
    setAssignedVendors([...assignedVendors, { id: v.id, name: v.name }]);
    setVendorSearch('');
    setShowVendorSearch(false);
  };

  const removeVendor = (id) => setAssignedVendors(assignedVendors.filter((v) => v.id !== id));

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...files.map((f) => f.name)]);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files.map((f) => f.name)]);
  };

  const handleSaveDraft = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date().toISOString(),
        description: form.description,
        items: lineItems.map((item) => ({
          item_name: item.name,
          quantity: item.quantity,
          unit: item.unit
        })),
        vendor_ids: assignedVendors.map((v) => v.id).filter(id => typeof id === 'string')
      };
      await createRFQ(payload);
      alert('RFQ saved as Draft!');
      setForm({ title: '', category: '', deadline: '', description: '' });
      setLineItems([]);
      setAssignedVendors([]);
      setActiveStep(1);
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to save RFQ draft');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendVendors = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        title: form.title,
        category: form.category,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date().toISOString(),
        description: form.description,
        items: lineItems.map((item) => ({
          item_name: item.name,
          quantity: item.quantity,
          unit: item.unit
        })),
        vendor_ids: assignedVendors.map((v) => v.id).filter(id => typeof id === 'string')
      };
      const res = await createRFQ(payload);
      const newRfqId = res.data.id;
      await publishRFQ(newRfqId);
      alert('RFQ published and sent to vendors!');
      setForm({ title: '', category: '', deadline: '', description: '' });
      setLineItems([]);
      setAssignedVendors([]);
      setActiveStep(1);
    } catch (err) {
      console.error(err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to publish RFQ');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────
     Review Summary helpers
  ───────────────────────────────────────────── */
  const ReviewRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-white text-right max-w-xs">{value || '—'}</span>
    </div>
  );

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className="space-y-6 pb-12">

      {submitError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-4 rounded-xl flex items-center space-x-3">
          <span>{submitError}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FaFileInvoice size={15} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create RFQ</h2>
          </div>
          <p className="text-slate-400 ml-12 text-sm">New Request For Quotation</p>
        </div>

        {/* Step navigation pills */}
        <div className="flex items-center space-x-2">
          {activeStep > 1 && (
            <button
              onClick={() => setActiveStep((s) => s - 1)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1e293b]/60 border border-white/10 text-slate-300 hover:text-white hover:border-white/25 transition duration-150"
            >
              ← Back
            </button>
          )}
          {activeStep < 3 && (
            <button
              onClick={() => setActiveStep((s) => s + 1)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs shadow-lg hover:shadow-blue-500/20 transition duration-150"
            >
              <span>Next Step</span>
              <FaChevronRight size={10} />
            </button>
          )}
        </div>
      </div>

      {/* ── Step Indicator ── */}
      <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
        <StepIndicator activeStep={activeStep} />
      </div>

      {/* ══════════════════════════════════════════
          STEP 1: Basic Details + Line Items + Vendors + Attachments
      ══════════════════════════════════════════ */}
      {activeStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: RFQ Details ── */}
          <div className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6 space-y-5">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1.5 h-5 rounded-full bg-blue-500" />
              <h3 className="text-base font-bold text-white">RFQ Details</h3>
            </div>

            {/* RFQ Title */}
            <div>
              <label className={labelCls}>RFQ Title</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Office Furniture Procurement Q3"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="" className="bg-[#1e293b] text-slate-400">Select category…</option>
                <option value="Furniture" className="bg-[#1e293b]">Furniture</option>
                <option value="IT Equipment" className="bg-[#1e293b]">IT Equipment</option>
                <option value="Construction" className="bg-[#1e293b]">Construction</option>
                <option value="Logistics" className="bg-[#1e293b]">Logistics</option>
                <option value="Services" className="bg-[#1e293b]">Services</option>
                <option value="Raw Materials" className="bg-[#1e293b]">Raw Materials</option>
              </select>
            </div>

            {/* Deadline Date */}
            <div>
              <label className={labelCls}>Deadline Date</label>
              <input
                type="date"
                className={`${inputCls} [color-scheme:dark]`}
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={4}
                placeholder="Describe the procurement requirement, scope, and any special conditions…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          {/* ── Right: Line Items ── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Line Items Card */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
                  <h3 className="text-base font-bold text-white">Line Items</h3>
                  <span className="ml-1 text-[10px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded-full font-semibold">
                    {lineItems.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowLineItemForm((v) => !v)}
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg transition duration-150"
                >
                  <FaPlus size={10} />
                  <span>Add Line Item</span>
                </button>
              </div>

              {/* Add Item Form */}
              {showLineItemForm && (
                <div className="bg-[#0f172a]/60 rounded-lg border border-white/10 p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3 sm:col-span-1">
                      <label className={labelCls}>Item Name</label>
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="e.g. Laptop Stand"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className={inputCls}
                        placeholder="0"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Unit</label>
                      <select
                        className={inputCls}
                        value={newItem.unit}
                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      >
                        <option className="bg-[#1e293b]">NOS</option>
                        <option className="bg-[#1e293b]">KG</option>
                        <option className="bg-[#1e293b]">MTR</option>
                        <option className="bg-[#1e293b]">LTR</option>
                        <option className="bg-[#1e293b]">SET</option>
                        <option className="bg-[#1e293b]">BOX</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={addLineItem}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition duration-150"
                    >
                      Add Item
                    </button>
                    <button
                      onClick={() => setShowLineItemForm(false)}
                      className="px-4 py-2 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs font-semibold rounded-lg border border-white/10 transition duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0f172a]/40 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Item Name</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-center">Unit</th>
                      <th className="px-4 py-3 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                    {lineItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition duration-100">
                        <td className="px-4 py-3 text-slate-500 text-xs">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                              <FaBoxOpen size={10} className="text-indigo-400" />
                            </div>
                            <span className="font-semibold text-white">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold text-white">{item.quantity}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[10px] bg-slate-700/50 text-slate-300 border border-white/10 px-2 py-0.5 rounded font-semibold tracking-wide">
                            {item.unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeLineItem(item.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition duration-150"
                            title="Remove item"
                          >
                            <FaTimes size={11} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {lineItems.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500 text-xs font-semibold">
                          No line items added yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Vendor Assignment Card ── */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                  <h3 className="text-base font-bold text-white">Assign Vendors</h3>
                  <span className="ml-1 text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-semibold">
                    {assignedVendors.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowVendorSearch((v) => !v)}
                  className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition duration-150"
                >
                  <FaPlus size={10} />
                  <span>Add Vendor</span>
                </button>
              </div>

              {/* Vendor Search Dropdown */}
              {showVendorSearch && (
                <div className="mb-4 relative">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                    <input
                      type="text"
                      autoFocus
                      className={`${inputCls} pl-9`}
                      placeholder="Search vendors…"
                      value={vendorSearch}
                      onChange={(e) => setVendorSearch(e.target.value)}
                    />
                  </div>
                  {filteredVendors.length > 0 && (
                    <div className="absolute z-30 mt-1 w-full bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
                      {filteredVendors.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => addVendor(v)}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition duration-100 text-left"
                        >
                          <FaBuilding size={12} className="text-emerald-400 shrink-0" />
                          <span className="text-sm text-slate-200">{v.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Vendor List */}
              <div className="space-y-2">
                {assignedVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between bg-[#0f172a]/50 border border-white/8 rounded-lg px-4 py-3 group hover:border-white/20 transition duration-150"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <FaBuilding size={12} className="text-emerald-400" />
                      </div>
                      <span className="text-sm font-semibold text-white">{vendor.name}</span>
                    </div>
                    <button
                      onClick={() => removeVendor(vendor.id)}
                      className="p-1.5 rounded bg-rose-500/0 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition duration-150 opacity-0 group-hover:opacity-100"
                      title="Remove vendor"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                ))}
                {assignedVendors.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs font-semibold border border-dashed border-white/10 rounded-lg">
                    No vendors assigned yet
                  </div>
                )}
              </div>
            </div>

            {/* ── Attachment Upload Card ── */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-amber-500" />
                <h3 className="text-base font-bold text-white">Attachments</h3>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group ${
                  isDragging
                    ? 'border-blue-500 bg-blue-500/5 scale-[1.01]'
                    : 'border-white/15 hover:border-blue-500/50 hover:bg-blue-500/[0.03]'
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all duration-200 ${
                  isDragging ? 'bg-blue-500/20 border border-blue-500/40 scale-110' : 'bg-[#0f172a]/60 border border-white/10 group-hover:border-blue-500/30'
                }`}>
                  <FaCloudUploadAlt size={22} className={isDragging ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400 transition-colors duration-150'} />
                </div>
                <p className="text-sm font-semibold text-slate-300 mb-1">
                  Drag &amp; Drop files here or{' '}
                  <span className="text-blue-400 underline underline-offset-2">click to upload</span>
                </p>
                <p className="text-xs text-slate-500">Supports PDF, XLSX, DOCX, PNG, JPG · Max 10MB each</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* Uploaded Files List */}
              {attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  {attachments.map((name, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#0f172a]/50 border border-white/8 rounded-lg px-4 py-2.5">
                      <span className="text-xs text-slate-300 font-medium truncate">{name}</span>
                      <button
                        onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                        className="ml-3 text-slate-500 hover:text-rose-400 transition duration-150"
                      >
                        <FaTimes size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 2: Items & Vendors – Edit view
      ══════════════════════════════════════════ */}
      {activeStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Line Items Full Edit */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <FaBoxOpen className="text-indigo-400" />
                <h3 className="text-base font-bold text-white">Line Items</h3>
              </div>
              <button
                onClick={() => setShowLineItemForm((v) => !v)}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-lg transition duration-150"
              >
                <FaPlus size={10} />
                <span>Add Line Item</span>
              </button>
            </div>

            {showLineItemForm && (
              <div className="bg-[#0f172a]/60 rounded-lg border border-white/10 p-4 mb-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3 sm:col-span-1">
                    <label className={labelCls}>Item Name</label>
                    <input type="text" className={inputCls} placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Quantity</label>
                    <input type="number" min="1" className={inputCls} placeholder="0" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <select className={inputCls} value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}>
                      {['NOS', 'KG', 'MTR', 'LTR', 'SET', 'BOX'].map((u) => <option key={u} className="bg-[#1e293b]">{u}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2 pt-1">
                  <button onClick={addLineItem} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition duration-150">Add</button>
                  <button onClick={() => setShowLineItemForm(false)} className="px-4 py-2 bg-transparent hover:bg-white/5 text-slate-400 text-xs font-semibold rounded-lg border border-white/10 transition duration-150">Cancel</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-[#0f172a]/40 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-center">Unit</th>
                    <th className="px-4 py-3 text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition duration-100">
                      <td className="px-4 py-3 text-slate-500 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                      <td className="px-4 py-3 text-center font-mono">{item.quantity}</td>
                      <td className="px-4 py-3 text-center"><span className="text-[10px] bg-slate-700/50 border border-white/10 px-2 py-0.5 rounded">{item.unit}</span></td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeLineItem(item.id)} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition duration-150"><FaTimes size={11} /></button>
                      </td>
                    </tr>
                  ))}
                  {lineItems.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-xs">No items added</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Assignment Full Edit */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <FaUsers className="text-emerald-400" />
                <h3 className="text-base font-bold text-white">Assign Vendors</h3>
              </div>
              <button
                onClick={() => setShowVendorSearch((v) => !v)}
                className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition duration-150"
              >
                <FaPlus size={10} />
                <span>Add Vendor</span>
              </button>
            </div>

            {showVendorSearch && (
              <div className="mb-4 relative">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                  <input
                    type="text"
                    autoFocus
                    className={`${inputCls} pl-9`}
                    placeholder="Search vendors…"
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                  />
                </div>
                {filteredVendors.length > 0 && (
                  <div className="absolute z-30 mt-1 w-full bg-[#1e293b] border border-white/15 rounded-xl shadow-2xl overflow-hidden">
                    {filteredVendors.map((v) => (
                      <button key={v} onClick={() => addVendor(v)} className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/5 transition duration-100 text-left">
                        <FaBuilding size={12} className="text-emerald-400 shrink-0" />
                        <span className="text-sm text-slate-200">{v}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {assignedVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between bg-[#0f172a]/50 border border-white/8 rounded-lg px-4 py-3 group hover:border-white/20 transition duration-150">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FaBuilding size={12} className="text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">{vendor.name}</span>
                  </div>
                  <button onClick={() => removeVendor(vendor.id)} className="p-1.5 rounded bg-rose-500/0 hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 transition duration-150 opacity-0 group-hover:opacity-100" title="Remove">
                    <FaTrash size={11} />
                  </button>
                </div>
              ))}
              {assignedVendors.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-white/10 rounded-lg">No vendors assigned</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          STEP 3: Review & Publish
      ══════════════════════════════════════════ */}
      {activeStep === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Summary */}
          <div className="lg:col-span-2 space-y-6">

            {/* RFQ Info Review */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-blue-500" />
                <h3 className="text-base font-bold text-white">RFQ Overview</h3>
              </div>
              <div className="space-y-1">
                <ReviewRow label="RFQ Title" value={form.title} />
                <ReviewRow label="Category" value={form.category} />
                <ReviewRow label="Deadline" value={form.deadline} />
                <ReviewRow label="Description" value={form.description} />
              </div>
            </div>

            {/* Items Review */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
                <h3 className="text-base font-bold text-white">Line Items Summary</h3>
              </div>
              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-[#0f172a]/40 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-center">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                    {lineItems.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-slate-500 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-white">{item.name}</td>
                        <td className="px-4 py-3 text-center font-mono">{item.quantity}</td>
                        <td className="px-4 py-3 text-center"><span className="text-[10px] bg-slate-700/50 border border-white/10 px-2 py-0.5 rounded">{item.unit}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Vendors + Attachments summary */}
          <div className="space-y-6">

            {/* Assigned Vendors */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
                <h3 className="text-base font-bold text-white">Vendors Notified</h3>
              </div>
              <div className="space-y-2">
                {assignedVendors.map((v) => (
                  <div key={v.id} className="flex items-center space-x-3 bg-[#0f172a]/50 border border-white/8 rounded-lg px-3 py-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FaBuilding size={11} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-white font-medium">{v.name}</span>
                  </div>
                ))}
                {assignedVendors.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-3">No vendors assigned</p>
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-amber-500" />
                <h3 className="text-base font-bold text-white">Attachments</h3>
              </div>
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((a, i) => (
                    <div key={i} className="text-xs text-slate-300 bg-[#0f172a]/50 border border-white/8 rounded-lg px-3 py-2 truncate">{a}</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 text-center py-3">No files attached</p>
              )}
            </div>

            {/* Publish Ready Card */}
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-700/20 border border-blue-500/25 rounded-xl p-5 relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-3">
                <FaCheck className="text-blue-400" size={14} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Ready to Publish</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review all sections above, then send to vendors or save as draft.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/8">
        <button
          onClick={handleSaveDraft}
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#1e293b]/60 hover:bg-[#1e293b] border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSave size={14} />
          <span>{submitting ? 'Saving...' : 'Save as Draft'}</span>
        </button>

        <button
          onClick={handleSendVendors}
          disabled={submitting}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane size={14} />
          <span>{submitting ? 'Publishing...' : 'Save & Send to Vendors'}</span>
        </button>
      </div>

    </div>
  );
}