import { useState } from 'react';
import {
  FaBalanceScale,
  FaCheckCircle,
  FaStar,
  FaTruck,
  FaShieldAlt,
  FaPercentage,
  FaFileInvoiceDollar,
  FaChevronRight,
  FaBuilding,
  FaInfoCircle,
  FaTrophy,
  FaThumbsUp,
  FaTimes,
} from 'react-icons/fa';

/* ─── Helpers ─────────────────────────────────── */
const fmt = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Data ────────────────────────────────────── */
const VENDORS = [
  {
    id: 1,
    name: 'Infra Supplies Pvt Ltd',
    shortName: 'Infra Supplies',
    grandTotal: 158400,
    gst: 18,
    deliveryDays: 7,
    rating: 4.8,
    warranty: '2 Years',
    items: [
      { name: 'Ergonomic Chair', qty: 25, unitPrice: 3300, total: 82500 },
      { name: 'Standing Desk',   qty: 10, unitPrice: 7590, total: 75900 },
    ],
    notes: 'Free installation included. Payment: 30 days credit.',
    isLowest: true,
    accentColor: 'emerald',
  },
  {
    id: 2,
    name: 'TechCore LTD',
    shortName: 'TechCore LTD',
    grandTotal: 198450,
    gst: 18,
    deliveryDays: 14,
    rating: 4.2,
    warranty: '1 Year',
    items: [
      { name: 'Ergonomic Chair', qty: 25, unitPrice: 4100, total: 102500 },
      { name: 'Standing Desk',   qty: 10, unitPrice: 8250, total: 82500 },
    ],
    notes: '50% advance, balance on delivery.',
    isLowest: false,
    accentColor: 'blue',
  },
  {
    id: 3,
    name: 'Office Need Co.',
    shortName: 'Office Need Co.',
    grandTotal: 211700,
    gst: 12,
    deliveryDays: 10,
    rating: 3.9,
    warranty: '18 Months',
    items: [
      { name: 'Ergonomic Chair', qty: 25, unitPrice: 4500, total: 112500 },
      { name: 'Standing Desk',   qty: 10, unitPrice: 8570, total: 85700 },
    ],
    notes: 'Payment on delivery. Extended warranty available.',
    isLowest: false,
    accentColor: 'indigo',
  },
];

const lowestTotal = Math.min(...VENDORS.map((v) => v.grandTotal));

/* ─── Star Rating ─────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={11}
          className={s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}
        />
      ))}
      <span className="ml-1.5 text-xs font-bold text-white">{rating}</span>
    </div>
  );
}

/* ─── Comparison Row ─────────────────────────── */
function CompareRow({ label, icon: Icon, iconColor, values, highlight }) {
  return (
    <div className="grid grid-cols-4 gap-0 border-b border-white/5 last:border-0 items-center">
      {/* Label */}
      <div className="px-4 py-3.5 flex items-center space-x-2">
        <Icon size={12} className={iconColor} />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      {/* Values */}
      {values.map((val, i) => {
        const isWinner = highlight && val === Math.min(...values.map(v => typeof v === 'number' ? v : Infinity));
        return (
          <div
            key={i}
            className={`px-4 py-3.5 text-center text-sm font-semibold transition-colors ${
              isWinner ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {val}
            {isWinner && (
              <span className="ml-1 text-[9px] text-emerald-500 font-bold align-super">★</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Component ────────────────────────────────── */
export default function QuotationComparison() {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [approved, setApproved] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null); // vendor id

  const handleSelect = (vendor) => {
    setShowConfirm(vendor.id);
  };

  const confirmSelect = () => {
    const vendor = VENDORS.find((v) => v.id === showConfirm);
    setSelectedVendor(vendor.id);
    if (vendor.isLowest) setApproved(vendor.id);
    setShowConfirm(null);
  };

  const accentMap = {
    emerald: {
      border: 'border-emerald-500/60',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      btn: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/25',
      ring: 'ring-2 ring-emerald-500/30',
      header: 'from-emerald-600/20 to-emerald-600/5',
      icon: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      glow: 'shadow-emerald-500/10',
    },
    blue: {
      border: 'border-white/10',
      badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',
      ring: '',
      header: 'from-blue-600/15 to-blue-600/5',
      icon: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      glow: 'shadow-blue-500/5',
    },
    indigo: {
      border: 'border-white/10',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25',
      ring: '',
      header: 'from-indigo-600/15 to-indigo-600/5',
      icon: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      glow: 'shadow-indigo-500/5',
    },
  };

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FaBalanceScale size={15} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Quotation Comparison</h2>
          </div>
          <div className="ml-12 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-slate-400 text-sm">
              RFQ: <span className="text-slate-200 font-semibold">Office Furniture Procurement Q2</span>
            </span>
            <span className="flex items-center space-x-1 text-xs text-blue-400 font-semibold">
              <FaFileInvoiceDollar size={11} />
              <span>{VENDORS.length} Quotations Received</span>
            </span>
          </div>
        </div>

        {selectedVendor && (
          <div className="flex items-center space-x-2 shrink-0">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
              <FaCheckCircle size={11} />
              <span>Vendor Selected</span>
            </span>
          </div>
        )}
      </div>

      {/* ── Tabular Comparison Matrix ── */}
      <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="grid grid-cols-4 border-b border-white/10 bg-[#0f172a]/40">
          <div className="px-4 py-4 flex items-center space-x-2">
            <div className="w-1.5 h-5 rounded-full bg-blue-500" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Compare</span>
          </div>
          {VENDORS.map((v) => {
            const ac = accentMap[v.accentColor];
            return (
              <div key={v.id} className={`px-4 py-4 text-center border-l border-white/5 ${v.isLowest ? 'bg-emerald-500/5' : ''}`}>
                <div className="flex flex-col items-center space-y-1.5">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${ac.icon}`}>
                    <FaBuilding size={13} />
                  </div>
                  <span className="text-xs font-bold text-white text-center leading-tight">{v.shortName}</span>
                  {v.isLowest && (
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${ac.badge}`}>
                      <FaTrophy size={8} className="inline mr-1" />Lowest
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Metric rows */}
        <CompareRow
          label="Grand Total"
          icon={FaFileInvoiceDollar}
          iconColor="text-emerald-400"
          values={VENDORS.map((v) => `₹${fmt(v.grandTotal)}`)}
          highlight={false}
        />
        <CompareRow
          label="GST %"
          icon={FaPercentage}
          iconColor="text-amber-400"
          values={VENDORS.map((v) => `${v.gst}%`)}
          highlight={false}
        />
        <CompareRow
          label="Delivery Days"
          icon={FaTruck}
          iconColor="text-blue-400"
          values={VENDORS.map((v) => v.deliveryDays)}
          highlight={true}
        />
        <CompareRow
          label="Vendor Rating"
          icon={FaStar}
          iconColor="text-amber-400"
          values={VENDORS.map((v) => v.rating)}
          highlight={false}
        />
        <CompareRow
          label="Warranty"
          icon={FaShieldAlt}
          iconColor="text-purple-400"
          values={VENDORS.map((v) => v.warranty)}
          highlight={false}
        />
      </div>

      {/* ── Vendor Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VENDORS.map((vendor) => {
          const ac = accentMap[vendor.accentColor];
          const isSelected = selectedVendor === vendor.id;
          const savings = vendor.grandTotal - lowestTotal;

          return (
            <div
              key={vendor.id}
              className={`relative bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl border shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
                vendor.isLowest
                  ? `${ac.border} ${ac.ring} ${ac.glow} shadow-lg`
                  : 'border-white/10'
              } ${isSelected ? 'scale-[1.02]' : 'hover:border-white/20 hover:scale-[1.01]'}`}
            >
              {/* Card Header Gradient */}
              <div className={`bg-gradient-to-br ${ac.header} px-5 pt-5 pb-4`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${ac.icon}`}>
                    <FaBuilding size={16} />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {vendor.isLowest && (
                      <span className={`flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${ac.badge}`}>
                        <FaTrophy size={9} />
                        <span>Lowest Price</span>
                      </span>
                    )}
                    {isSelected && (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-white uppercase tracking-wider">
                        <FaCheckCircle size={9} className="text-emerald-400" />
                        <span>Selected</span>
                      </span>
                    )}
                    {!vendor.isLowest && savings > 0 && (
                      <span className="text-[9px] text-rose-400 font-semibold">
                        +₹{fmt(savings)} vs lowest
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white leading-tight">{vendor.name}</h3>
                <StarRating rating={vendor.rating} />

                {/* Grand Total */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Grand Total</span>
                  <span className={`text-2xl font-bold font-mono ${vendor.isLowest ? 'text-emerald-400' : 'text-white'}`}>
                    ₹{fmt(vendor.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-5 py-4 space-y-4 flex-1">

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'GST', value: `${vendor.gst}%`, icon: FaPercentage, color: 'text-amber-400' },
                    { label: 'Delivery', value: `${vendor.deliveryDays}d`, icon: FaTruck, color: 'text-blue-400' },
                    { label: 'Warranty', value: vendor.warranty, icon: FaShieldAlt, color: 'text-purple-400' },
                  ].map((m) => (
                    <div key={m.label} className="bg-[#0f172a]/50 border border-white/8 rounded-lg p-2.5 text-center">
                      <m.icon size={12} className={`${m.color} mx-auto mb-1`} />
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">{m.label}</span>
                      <span className="text-xs font-bold text-white">{m.value}</span>
                    </div>
                  ))}
                </div>

                {/* Line Items Breakdown */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Item Breakdown</span>
                  <div className="space-y-1.5">
                    {vendor.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#0f172a]/40 border border-white/5 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-xs font-semibold text-white">{item.name}</span>
                          <span className="text-[10px] text-slate-500 block">×{item.qty} @ ₹{item.unitPrice.toLocaleString()}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-300">₹{fmt(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {vendor.notes && (
                  <div className="bg-[#0f172a]/40 border border-white/5 rounded-lg px-3 py-2.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-0.5">Terms</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{vendor.notes}</p>
                  </div>
                )}
              </div>

              {/* Card Footer: Action Button */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => handleSelect(vendor)}
                  disabled={isSelected}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm shadow-lg transition-all duration-150 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-white/5 border border-white/10 text-slate-500 cursor-default'
                      : `${ac.btn} text-white shadow-lg`
                  }`}
                >
                  {isSelected ? (
                    <>
                      <FaCheckCircle size={13} className="text-emerald-400" />
                      <span>Vendor Selected</span>
                    </>
                  ) : vendor.isLowest ? (
                    <>
                      <FaThumbsUp size={13} />
                      <span>Select &amp; Approve</span>
                      <FaChevronRight size={10} />
                    </>
                  ) : (
                    <>
                      <FaCheckCircle size={13} />
                      <span>Select Vendor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Informational Note ── */}
      <div className="flex items-start space-x-3 bg-blue-500/8 border border-blue-500/20 rounded-xl px-5 py-4">
        <FaInfoCircle className="text-blue-400 shrink-0 mt-0.5" size={15} />
        <div>
          <p className="text-sm font-semibold text-white mb-0.5">Approval Workflow</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Selecting a vendor will initiate the approval workflow. The selected quotation will be sent to the procurement manager for review before a Purchase Order is generated.
          </p>
        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] w-full max-w-md border border-white/20 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowConfirm(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-150"
            >
              <FaTimes size={16} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <FaBalanceScale className="text-emerald-400" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Selection</h3>
                <p className="text-xs text-slate-400">This will trigger the approval workflow</p>
              </div>
            </div>

            {(() => {
              const v = VENDORS.find((v) => v.id === showConfirm);
              return v ? (
                <div className="bg-[#0f172a]/60 border border-white/10 rounded-xl p-4 mb-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <FaBuilding className="text-blue-400" />
                    <span className="text-sm font-bold text-white">{v.name}</span>
                    {v.isLowest && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                        Lowest Price
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Grand Total</span>
                    <span className="font-mono font-bold text-emerald-400">₹{fmt(v.grandTotal)}</span>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-transparent border border-white/15 text-slate-300 hover:text-white hover:border-white/30 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={confirmSelect}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-emerald-500/25 transition duration-150 flex items-center justify-center space-x-2"
              >
                <FaCheckCircle size={13} />
                <span>Confirm &amp; Proceed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approval trigger banner (shown after selection) ── */}
      {approved && (
        <div className="flex items-center space-x-4 bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border border-emerald-500/30 rounded-xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <FaCheckCircle className="text-emerald-400" size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-300">Approval Workflow Initiated</p>
            <p className="text-xs text-slate-400 mt-0.5">
              <span className="font-semibold text-white">{VENDORS.find((v) => v.id === approved)?.name}</span> has been selected. A notification has been sent to the Procurement Manager for final approval.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}