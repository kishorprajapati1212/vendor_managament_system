import { useState, useRef } from 'react';
import {
  FaFileInvoiceDollar,
  FaDownload,
  FaPrint,
  FaEnvelope,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaBoxOpen,
  FaStamp,
  FaCalendarAlt,
  FaHashtag,
  FaCheck,
  FaBolt,
} from 'react-icons/fa';

/* ─── Data ─────────────────────────────────── */
const PO = {
  number:      'PO-2025-0068',
  poDate:      '22 May 2025',
  invoiceDate: '22 May 2025',
  dueDate:     '21 June 2025',
  rfq:         'Office Furniture Q2',
};

const BILL_TO = {
  name:    'Your Organization Name',
  address: '123 Business Park',
  city:    'Ahmedabad, Gujarat – 380001',
  gstin:   '24ABCDE1234F1Z5',
};

const VENDOR = {
  name:    'Infra Supplies Pvt Ltd',
  address: 'Industrial Estate, Phase II',
  city:    'Surat, Gujarat – 395003',
  gstin:   '24ABCDE5678G1Z8',
};

const ITEMS = [
  { id: 1, name: 'Ergonomic Chair', desc: 'High-back ergonomic office chair with lumbar support', qty: 25, unit: 'NOS', unitPrice: 3300 },
  { id: 2, name: 'Standing Desk',   desc: 'Height-adjustable electric standing desk, 60×30 in',  qty: 10, unit: 'NOS', unitPrice: 7590 },
];

const GST_RATE = 18; // %

/* ─── Helpers ───────────────────────────────── */
const fmt = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Component ─────────────────────────────── */
export default function InvoiceManagement() {
  const [paid, setPaid] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const subtotal  = ITEMS.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const cgst      = (subtotal * GST_RATE) / 200;
  const sgst      = (subtotal * GST_RATE) / 200;
  const grandTotal = subtotal + cgst + sgst;

  const handleEmail = () => {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  /* ── Top action buttons ── */
  const ActionBtn = ({ icon: Icon, label, onClick, className = '' }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition duration-150 active:scale-[0.98] ${className}`}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FaFileInvoiceDollar size={15} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Purchase Order &amp; Invoice</h2>
          </div>
          <div className="ml-12 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="text-slate-400 text-sm font-mono font-semibold text-emerald-400/90">{PO.number}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 text-sm flex items-center space-x-1">
              <FaBolt size={10} className="text-amber-400" />
              <span>Auto Generated After Approval</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <ActionBtn
            icon={FaDownload}
            label="Download PDF"
            className="bg-blue-600/15 border-blue-500/30 text-blue-400 hover:bg-blue-600/25 hover:border-blue-500/50"
          />
          <ActionBtn
            icon={FaPrint}
            label="Print Invoice"
            onClick={() => window.print()}
            className="bg-[#1e293b]/60 border-white/15 text-slate-300 hover:text-white hover:border-white/30"
          />
          <ActionBtn
            icon={FaEnvelope}
            label={emailSent ? 'Sent!' : 'Email Invoice'}
            onClick={handleEmail}
            className={emailSent
              ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
              : 'bg-[#1e293b]/60 border-white/15 text-slate-300 hover:text-white hover:border-white/30'}
          />
        </div>
      </div>

      {/* ── Main Invoice Card ── */}
      <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">

        {/* Invoice Top Bar */}
        <div className="bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-emerald-600/15 px-8 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-0.5">
              <FaStamp size={18} className="text-blue-400" />
              <span className="text-lg font-bold text-white tracking-wide">TAX INVOICE</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">{PO.number}</span>
          </div>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider ${
            paid
              ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-300'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          }`}>
            {paid ? <FaCheckCircle size={12} /> : <FaClock size={12} />}
            <span>{paid ? 'Paid' : 'Pending Payment'}</span>
          </div>
        </div>

        <div className="p-8 space-y-8">

          {/* ── Company Info Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Bill To */}
            <div className="md:col-span-1 bg-[#0f172a]/50 border border-white/8 rounded-xl p-5">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3 flex items-center space-x-1.5">
                <FaBuilding size={10} />
                <span>Bill To</span>
              </span>
              <p className="text-sm font-bold text-white mb-1">{BILL_TO.name}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{BILL_TO.address}</p>
              <p className="text-xs text-slate-400">{BILL_TO.city}</p>
              <div className="mt-3 flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">GSTIN:</span>
                <span className="text-xs font-mono font-semibold text-slate-300">{BILL_TO.gstin}</span>
              </div>
            </div>

            {/* Vendor */}
            <div className="md:col-span-1 bg-[#0f172a]/50 border border-white/8 rounded-xl p-5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-3 flex items-center space-x-1.5">
                <FaBuilding size={10} />
                <span>Vendor / Ship From</span>
              </span>
              <p className="text-sm font-bold text-white mb-1">{VENDOR.name}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{VENDOR.address}</p>
              <p className="text-xs text-slate-400">{VENDOR.city}</p>
              <div className="mt-3 flex items-center space-x-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">GSTIN:</span>
                <span className="text-xs font-mono font-semibold text-slate-300">{VENDOR.gstin}</span>
              </div>
            </div>

            {/* Document Info */}
            <div className="md:col-span-1 bg-[#0f172a]/50 border border-white/8 rounded-xl p-5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3 flex items-center space-x-1.5">
                <FaHashtag size={10} />
                <span>Document Info</span>
              </span>
              <div className="space-y-2.5">
                {[
                  { label: 'PO Number',     value: PO.number,      mono: true  },
                  { label: 'PO Date',       value: PO.poDate,      mono: false },
                  { label: 'Invoice Date',  value: PO.invoiceDate, mono: false },
                  { label: 'Due Date',      value: PO.dueDate,     mono: false, highlight: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{row.label}</span>
                    <span className={`text-xs font-semibold ${
                      row.highlight ? 'text-amber-400' : row.mono ? 'font-mono text-blue-300' : 'text-white'
                    }`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Invoice Table ── */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold text-white">Line Items</h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-left border-collapse min-w-[520px]">
                <thead>
                  <tr className="border-b border-white/8 bg-[#0f172a]/60 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-5 py-4 w-6">#</th>
                    <th className="px-5 py-4">Item &amp; Description</th>
                    <th className="px-5 py-4 text-center">Qty</th>
                    <th className="px-5 py-4 text-center">Unit</th>
                    <th className="px-5 py-4 text-right">Unit Price</th>
                    <th className="px-5 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {ITEMS.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition duration-100">
                      <td className="px-5 py-4 text-slate-500 text-xs">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <FaBoxOpen size={13} className="text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{item.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-slate-300">{item.qty}</td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-[10px] bg-slate-700/60 border border-white/10 px-2 py-0.5 rounded font-semibold text-slate-300">{item.unit}</span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-slate-300">₹{fmt(item.unitPrice)}</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-white">₹{fmt(item.qty * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Pricing Summary + Payment ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

            {/* Notes / Terms */}
            <div className="bg-[#0f172a]/40 border border-white/8 rounded-xl p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Terms &amp; Notes</p>
              <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <FaCheck size={10} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Payment due within 30 days of invoice date.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FaCheck size={10} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Goods to be delivered within 10 business days.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FaCheck size={10} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>2-year warranty on all items from date of delivery.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <FaCheck size={10} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bank transfer preferred. NEFT/RTGS details shared separately.</span>
                </li>
              </ul>
            </div>

            {/* Pricing Summary */}
            <div className="bg-[#0f172a]/60 border border-white/10 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-white/8 bg-[#0f172a]/40">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing Breakdown</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                {[
                  { label: 'Subtotal',            value: subtotal,   color: 'text-white'       },
                  { label: `CGST (${GST_RATE/2}%)`, value: cgst,    color: 'text-amber-400'   },
                  { label: `SGST (${GST_RATE/2}%)`, value: sgst,    color: 'text-amber-400'   },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="text-slate-400">{row.label}</span>
                    <span className={`font-mono font-semibold ${row.color}`}>₹{fmt(row.value)}</span>
                  </div>
                ))}
              </div>

              {/* Grand Total */}
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Grand Total</span>
                <span className="text-xl font-bold font-mono text-emerald-400">₹{fmt(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* ── Payment Status & Action ── */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border transition-all duration-500 ${
            paid
              ? 'bg-emerald-500/8 border-emerald-500/25'
              : 'bg-amber-500/8 border-amber-500/20'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                paid
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-amber-500/15 border-amber-500/25'
              }`}>
                {paid
                  ? <FaCheckCircle size={16} className="text-emerald-400" />
                  : <FaClock size={16} className="text-amber-400" />
                }
              </div>
              <div>
                <p className={`text-sm font-bold ${paid ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {paid ? 'Payment Received' : 'Pending Payment'}
                </p>
                <p className="text-xs text-slate-400">
                  {paid
                    ? `Grand Total ₹${fmt(grandTotal)} marked as paid`
                    : `Due by ${PO.dueDate} · Amount ₹${fmt(grandTotal)}`
                  }
                </p>
              </div>
            </div>

            {!paid ? (
              <button
                onClick={() => setPaid(true)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-emerald-500/30 transition duration-150 active:scale-[0.98] whitespace-nowrap"
              >
                <FaStamp size={13} />
                <span>Mark As Paid</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold">
                  <FaCheckCircle size={11} />
                  <span>Paid ✓</span>
                </span>
                <button
                  onClick={() => setPaid(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition duration-150 underline underline-offset-2 px-2"
                >
                  Undo
                </button>
              </div>
            )}
          </div>

          {/* ── Invoice Footer ── */}
          <div className="border-t border-white/8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
            <span>This is a computer-generated invoice and does not require a physical signature.</span>
            <span className="font-mono">Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>

        </div>
      </div>
    </div>
  );
}