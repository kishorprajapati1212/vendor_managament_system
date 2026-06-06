import { useState, useCallback } from 'react';
import {
  FaListUl,
  FaCalendarAlt,
  FaTag,
  FaBoxOpen,
  FaStickyNote,
  FaPercentage,
  FaCalculator,
  FaPaperPlane,
  FaSave,
  FaChevronDown,
  FaCheck,
  FaTruck,
  FaFileInvoiceDollar,
} from 'react-icons/fa';

/* ─── Helpers ─────────────────────────────────── */
const fmt = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const inputCls =
  'w-full px-3 py-2.5 bg-[#0f172a]/70 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150 text-sm';

const labelCls =
  'block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5';

/* ─── RFQ Summary Card ─────────────────────────── */
const rfqMeta = {
  name: 'Office Furniture Procurement Q2',
  category: 'Furniture',
  deadline: '15 June 2025',
  items: [
    { name: 'Ergonomic Chair', qty: 25 },
    { name: 'Standing Desk', qty: 10 },
  ],
};

/* ─── Initial quotation rows ───────────────────── */
const INITIAL_ROWS = [
  { id: 1, item: 'Ergonomic Chair', qty: 25, unit: 'NOS', unitPrice: 3500, deliveryDays: 7 },
  { id: 2, item: 'Standing Desk',   qty: 10, unit: 'NOS', unitPrice: 8200, deliveryDays: 14 },
];

/* ─── Component ────────────────────────────────── */
export default function VendorQuotations() {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [gst, setGst] = useState(18);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState(false);

  /* computed totals */
  const subtotal = rows.reduce((acc, r) => acc + r.qty * r.unitPrice, 0);
  const gstAmt   = (subtotal * gst) / 100;
  const grandTotal = subtotal + gstAmt;

  const updateRow = useCallback((id, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: Number(value) || value } : r))
    );
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleDraft = () => {
    setDraft(true);
    setTimeout(() => setDraft(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FaListUl size={14} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Submit Quotation</h2>
          </div>
          <div className="ml-12 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-slate-400 text-sm">
              RFQ: <span className="text-slate-200 font-semibold">{rfqMeta.name}</span>
            </span>
            <span className="flex items-center space-x-1 text-xs text-amber-400 font-semibold">
              <FaCalendarAlt size={11} />
              <span>Deadline: {rfqMeta.deadline}</span>
            </span>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-lg text-xs font-semibold">
            <FaCalendarAlt size={10} />
            <span>Open for Bidding</span>
          </span>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* ── Left: RFQ Summary Card ── */}
        <div className="xl:col-span-1 space-y-6">

          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-purple-500" />
              <h3 className="text-sm font-bold text-white">RFQ Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="bg-[#0f172a]/60 rounded-lg border border-white/8 p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">RFQ Name</span>
                <span className="text-xs font-semibold text-white leading-snug">{rfqMeta.name}</span>
              </div>

              <div className="bg-[#0f172a]/60 rounded-lg border border-white/8 p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Category</span>
                <div className="flex items-center space-x-1.5">
                  <FaTag size={10} className="text-purple-400" />
                  <span className="text-xs font-semibold text-white">{rfqMeta.category}</span>
                </div>
              </div>

              <div className="bg-[#0f172a]/60 rounded-lg border border-white/8 p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Requested Items</span>
                <div className="space-y-2">
                  {rfqMeta.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                          <FaBoxOpen size={9} className="text-indigo-400" />
                        </div>
                        <span className="text-xs text-slate-300">{it.name}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-white bg-[#0f172a] border border-white/10 px-1.5 py-0.5 rounded">
                        ×{it.qty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a]/60 rounded-lg border border-white/8 p-3">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Deadline</span>
                <div className="flex items-center space-x-1.5">
                  <FaCalendarAlt size={10} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">{rfqMeta.deadline}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-white">Pricing Summary</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-400">Subtotal</span>
                <span className="text-sm font-semibold text-white font-mono">₹{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-400">GST ({gst}%)</span>
                <span className="text-sm font-semibold text-amber-400 font-mono">+₹{fmt(gstAmt)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-bold text-white">Grand Total</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">₹{fmt(grandTotal)}</span>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-4 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / 200000) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Budget utilisation</p>
          </div>
        </div>

        {/* ── Right: Quotation Table + Tax ── */}
        <div className="xl:col-span-3 space-y-6">

          {/* Quotation Table Card */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-1.5 h-5 rounded-full bg-blue-500" />
              <h3 className="text-base font-bold text-white">Quotation Details</h3>
              <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded-full font-semibold">
                {rows.length} items
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-white/8">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/8 bg-[#0f172a]/50 text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                    <th className="px-4 py-3 w-5">#</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-center">Unit</th>
                    <th className="px-4 py-3 text-right">Unit Price (₹)</th>
                    <th className="px-4 py-3 text-right">Total (₹)</th>
                    <th className="px-4 py-3 text-center">Delivery Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {rows.map((row, idx) => {
                    const rowTotal = row.qty * row.unitPrice;
                    return (
                      <tr key={row.id} className="hover:bg-white/[0.025] transition duration-100 group">
                        <td className="px-4 py-4 text-slate-500 text-xs">{String(idx + 1).padStart(2, '0')}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                              <FaBoxOpen size={11} className="text-indigo-400" />
                            </div>
                            <span className="font-semibold text-white">{row.item}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-mono text-slate-300">{row.qty}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-[10px] bg-slate-700/60 border border-white/10 px-2 py-0.5 rounded font-semibold text-slate-300">{row.unit}</span>
                        </td>
                        {/* Editable unit price */}
                        <td className="px-4 py-4 text-right">
                          <div className="relative inline-flex items-center">
                            <span className="absolute left-3 text-slate-500 text-xs pointer-events-none">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={row.unitPrice}
                              onChange={(e) => updateRow(row.id, 'unitPrice', e.target.value)}
                              className="w-28 pl-7 pr-3 py-2 bg-[#0f172a]/80 border border-white/10 text-right text-white font-mono text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150"
                            />
                          </div>
                        </td>
                        {/* Auto-calculated total */}
                        <td className="px-4 py-4 text-right font-mono font-bold text-emerald-400">
                          ₹{fmt(rowTotal)}
                        </td>
                        {/* Editable delivery days */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <FaTruck size={11} className="text-slate-500" />
                            <input
                              type="number"
                              min="1"
                              value={row.deliveryDays}
                              onChange={(e) => updateRow(row.id, 'deliveryDays', e.target.value)}
                              className="w-16 px-2 py-2 bg-[#0f172a]/80 border border-white/10 text-center text-white font-mono text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150"
                            />
                            <span className="text-[10px] text-slate-500">days</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Subtotal footer row */}
                <tfoot>
                  <tr className="border-t border-white/10 bg-[#0f172a]/30">
                    <td colSpan={5} className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Subtotal
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      ₹{fmt(subtotal)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Tax & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* GST */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-5 rounded-full bg-amber-500" />
                <h3 className="text-sm font-bold text-white">Tax Information</h3>
              </div>

              <div>
                <label className={labelCls}>GST Percentage</label>
                <div className="relative">
                  <FaPercentage className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={gst}
                    onChange={(e) => setGst(Number(e.target.value))}
                    className={`${inputCls} pr-8`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">GST will be applied on the subtotal amount</p>
              </div>

              {/* GST breakdown preview */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Taxable Amount</span>
                  <span className="text-slate-300 font-mono">₹{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">CGST ({gst / 2}%)</span>
                  <span className="text-amber-400 font-mono">₹{fmt(gstAmt / 2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">SGST ({gst / 2}%)</span>
                  <span className="text-amber-400 font-mono">₹{fmt(gstAmt / 2)}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/8 pt-2">
                  <span className="font-semibold text-slate-300">Total GST</span>
                  <span className="font-bold text-amber-400 font-mono">₹{fmt(gstAmt)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-1.5 h-5 rounded-full bg-slate-400" />
                <h3 className="text-sm font-bold text-white">Notes / Terms</h3>
              </div>
              <label className={labelCls}>Additional Notes</label>
              <textarea
                rows={5}
                className={`${inputCls} resize-none`}
                placeholder="Enter payment terms, warranty, delivery conditions, special notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 mt-2">These notes will be visible to the procurement team.</p>
            </div>
          </div>

          {/* Grand Total Summary Banner */}
          <div className="bg-gradient-to-r from-emerald-600/15 via-blue-600/10 to-emerald-600/15 border border-emerald-500/20 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -left-10 top-0 w-40 h-full bg-emerald-500/5 rounded-full blur-3xl" />
              <div className="absolute -right-10 top-0 w-40 h-full bg-blue-500/5 rounded-full blur-3xl" />
            </div>
            <div className="flex items-center space-x-4 z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <FaCalculator className="text-emerald-400" size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Grand Total (incl. GST)</span>
                <span className="text-2xl font-bold text-emerald-400 font-mono">₹{fmt(grandTotal)}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 z-10 text-xs">
              <div className="text-center">
                <span className="text-slate-500 block">Subtotal</span>
                <span className="font-mono font-bold text-white">₹{fmt(subtotal)}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block">GST ({gst}%)</span>
                <span className="font-mono font-bold text-amber-400">₹{fmt(gstAmt)}</span>
              </div>
              <div className="text-center">
                <span className="text-slate-500 block">Items</span>
                <span className="font-mono font-bold text-white">{rows.length}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/8">
            <button
              onClick={handleDraft}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-[#1e293b]/70 hover:bg-[#1e293b] border border-white/15 hover:border-white/30 text-slate-300 hover:text-white font-semibold rounded-xl text-sm transition duration-150 active:scale-[0.98]"
            >
              {draft ? <FaCheck size={13} className="text-emerald-400" /> : <FaSave size={13} />}
              <span>{draft ? 'Saved as Draft!' : 'Save Draft'}</span>
            </button>

            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg hover:shadow-purple-500/25 transition duration-150 active:scale-[0.98]"
            >
              {submitted ? <FaCheck size={13} /> : <FaPaperPlane size={13} />}
              <span>{submitted ? 'Quotation Submitted!' : 'Submit Quotation'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}