import { useState } from 'react';
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaCheck,
  FaTimes,
  FaUserTie,
  FaBuilding,
  FaTruck,
  FaStar,
  FaFileInvoiceDollar,
  FaClipboardCheck,
  FaShieldAlt,
  FaExclamationTriangle,
  FaChevronRight,
  FaStamp,
  FaBolt,
  FaHistory,
} from 'react-icons/fa';

/* ─── Workflow Stages ─────────────────────────── */
const STAGES = [
  { id: 1, label: 'Submitted',   short: 'Submitted' },
  { id: 2, label: 'L1 Review',   short: 'L1 Review' },
  { id: 3, label: 'L2 Approval', short: 'L2 Approval' },
  { id: 4, label: 'Generate PO', short: 'Generate PO' },
];

const ACTIVE_STAGE = 3; // L2 Approval

/* ─── Approvers ───────────────────────────────── */
const INITIAL_APPROVERS = [
  {
    id: 1,
    name: 'Rahul Mehta',
    role: 'Procurement Head',
    level: 'L1',
    status: 'approved',
    date: 'May 20, 10:32 AM',
    avatar: 'RM',
    color: 'emerald',
  },
  {
    id: 2,
    name: 'Priya Shah',
    role: 'Finance Manager',
    level: 'L2',
    status: 'pending',
    date: 'Assigned: May 21',
    avatar: 'PS',
    color: 'blue',
  },
];

/* ─── Quotation Summary ───────────────────────── */
const QUOTATION = {
  vendor: 'Infra Supplies Pvt Ltd',
  rfq: 'Office Furniture Q2',
  total: '₹1,85,400',
  delivery: '10 Days',
  rating: 4.5,
  gst: '18%',
  items: 2,
  category: 'Furniture',
};

/* ─── Star Rating ─────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={12}
          className={s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}
        />
      ))}
      <span className="ml-1.5 text-xs font-bold text-white">{rating}/5</span>
    </div>
  );
}

/* ─── Progress Stage Component ────────────────── */
function StageNode({ stage, activeStage, isLast }) {
  const isCompleted = stage.id < activeStage;
  const isActive    = stage.id === activeStage;
  const isFuture    = stage.id > activeStage;

  return (
    <div className="flex items-center flex-1 last:flex-none min-w-0">
      <div className="flex flex-col items-center shrink-0">
        {/* Circle */}
        <div
          className={`relative w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-500 ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : isActive
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/25 ring-4 ring-blue-500/15'
              : 'bg-[#0f172a] border-white/10 text-slate-500'
          }`}
        >
          {isCompleted ? <FaCheck size={14} /> : stage.id}
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0b0f19] animate-pulse" />
          )}
        </div>
        {/* Label */}
        <span
          className={`mt-2 text-[11px] font-semibold text-center whitespace-nowrap transition-colors duration-200 ${
            isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
          }`}
        >
          {stage.label}
        </span>
        {isActive && (
          <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider mt-0.5">
            In Progress
          </span>
        )}
        {isCompleted && (
          <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
            Done
          </span>
        )}
      </div>
      {/* Connector line */}
      {!isLast && (
        <div className="flex-1 mx-3 mb-6 relative h-px overflow-hidden">
          <div className="absolute inset-0 bg-white/8" />
          <div
            className={`absolute inset-0 origin-left transition-all duration-700 ${
              isCompleted ? 'bg-emerald-500 scale-x-100' : 'bg-white/5 scale-x-100'
            }`}
          />
          {isCompleted && (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-400/40 to-emerald-500/0 animate-pulse" />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Approver Card ───────────────────────────── */
function ApproverCard({ approver, isCurrentUser }) {
  const approved = approver.status === 'approved';
  const rejected = approver.status === 'rejected';
  const pending  = approver.status === 'pending';

  const statusConfig = {
    approved: { icon: FaCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Approved' },
    rejected: { icon: FaTimesCircle, color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    label: 'Rejected' },
    pending:  { icon: FaHourglassHalf, color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20',  label: 'Waiting' },
  };

  const s = statusConfig[approver.status];
  const avatarColor = {
    emerald: 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300',
    blue:    'bg-blue-600/20 border-blue-500/30 text-blue-300',
    rose:    'bg-rose-600/20 border-rose-500/30 text-rose-300',
  }[approver.color] || 'bg-slate-700/40 border-white/10 text-slate-300';

  return (
    <div
      className={`relative flex items-start space-x-4 p-4 rounded-xl border transition-all duration-300 ${
        isCurrentUser
          ? 'bg-blue-600/8 border-blue-500/30 shadow-blue-500/10 shadow-lg'
          : 'bg-[#0f172a]/50 border-white/8 hover:border-white/15'
      }`}
    >
      {/* Level badge */}
      <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">
        {approver.level}
      </span>

      {/* Avatar */}
      <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor}`}>
        {approver.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-0.5">
          <span className="text-sm font-bold text-white">{approver.name}</span>
        </div>
        <span className="text-xs text-slate-400 flex items-center space-x-1 mb-2">
          <FaUserTie size={10} className="shrink-0" />
          <span>{approver.role}</span>
        </span>

        <div className="flex items-center justify-between">
          {/* Status badge */}
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${s.bg} ${s.color}`}>
            <s.icon size={10} />
            <span>{s.label}</span>
          </span>
          {/* Date */}
          <span className="text-[10px] text-slate-500 font-medium">{approver.date}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────── */
export default function ApprovalWorkflow() {
  const [approvers, setApprovers]   = useState(INITIAL_APPROVERS);
  const [remarks, setRemarks]       = useState('');
  const [actionStatus, setActionStatus] = useState(null); // 'approved' | 'rejected' | null
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleApprove = () => {
    setApprovers((prev) =>
      prev.map((a) => (a.id === 2 ? { ...a, status: 'approved', date: 'May 21, 11:45 AM', color: 'emerald' } : a))
    );
    setActionStatus('approved');
  };

  const handleReject = () => {
    setShowRejectConfirm(false);
    setApprovers((prev) =>
      prev.map((a) => (a.id === 2 ? { ...a, status: 'rejected', date: 'May 21, 11:45 AM', color: 'rose' } : a))
    );
    setActionStatus('rejected');
  };

  const handleReset = () => {
    setApprovers(INITIAL_APPROVERS);
    setActionStatus(null);
    setRemarks('');
  };

  const currentActiveStage = actionStatus === 'approved' ? 4 : ACTIVE_STAGE;

  return (
    <div className="space-y-6 pb-12">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FaClipboardCheck size={15} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Approval Workflow</h2>
          </div>
          <div className="ml-12 flex flex-wrap items-center gap-x-5 gap-y-1 mt-1">
            <span className="text-slate-400 text-sm">
              RFQ: <span className="text-slate-200 font-semibold">{QUOTATION.rfq}</span>
            </span>
            <span className="text-slate-400 text-sm">
              Vendor: <span className="text-blue-300 font-semibold">Infra Supplies</span>
            </span>
            <span className="text-slate-400 text-sm">
              Amount: <span className="text-emerald-400 font-bold font-mono">{QUOTATION.total}</span>
            </span>
          </div>
        </div>

        {/* Status pill */}
        <div className="shrink-0 flex items-center space-x-2">
          {actionStatus === 'approved' && (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold">
              <FaCheckCircle size={11} /> <span>Approved</span>
            </span>
          )}
          {actionStatus === 'rejected' && (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold">
              <FaTimesCircle size={11} /> <span>Rejected</span>
            </span>
          )}
          {!actionStatus && (
            <span className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 rounded-lg text-xs font-semibold">
              <FaHourglassHalf size={10} /> <span>Awaiting L2 Approval</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Workflow Progress Tracker ── */}
      <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-5 rounded-full bg-blue-500" />
            <h3 className="text-sm font-bold text-white">Workflow Progress</h3>
          </div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            Stage {currentActiveStage} of {STAGES.length}
          </span>
        </div>

        <div className="flex items-start w-full">
          {STAGES.map((stage, idx) => (
            <StageNode
              key={stage.id}
              stage={stage}
              activeStage={currentActiveStage}
              isLast={idx === STAGES.length - 1}
            />
          ))}
        </div>
      </div>

      {/* ── Success / Rejection Banners ── */}
      {actionStatus === 'approved' && (
        <div className="flex items-start space-x-4 bg-gradient-to-r from-emerald-600/20 to-emerald-600/5 border border-emerald-500/35 rounded-xl px-5 py-4 animate-[fadeIn_0.4s_ease-out]">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/25 border border-emerald-500/35 flex items-center justify-center shrink-0">
            <FaCheckCircle className="text-emerald-400" size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-emerald-300 mb-0.5">Approval completed successfully.</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Purchase Order generation unlocked. The procurement team has been notified and a PO draft will be created automatically.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition duration-150">
              <FaBolt size={10} />
              <span>Generate PO</span>
            </button>
            <button onClick={handleReset} className="text-slate-500 hover:text-white text-xs transition duration-150 px-2 py-1.5 rounded-lg hover:bg-white/5">
              Reset Demo
            </button>
          </div>
        </div>
      )}

      {actionStatus === 'rejected' && (
        <div className="flex items-start space-x-4 bg-rose-600/10 border border-rose-500/30 rounded-xl px-5 py-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
            <FaExclamationTriangle className="text-rose-400" size={16} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-rose-300 mb-0.5">Quotation Rejected.</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              This quotation has been rejected. The vendor and procurement team will be notified. You may initiate a new RFQ or request revised quotations.
            </p>
          </div>
          <button onClick={handleReset} className="text-slate-500 hover:text-white text-xs transition duration-150 px-2 py-1.5 rounded-lg hover:bg-white/5 shrink-0">
            Reset Demo
          </button>
        </div>
      )}

      {/* ── Main Two-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Approval Chain + Remarks ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Approval Chain */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-5">
              <div className="w-1.5 h-5 rounded-full bg-purple-500" />
              <h3 className="text-base font-bold text-white">Approval Chain</h3>
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/25 px-2 py-0.5 rounded-full font-semibold">
                {approvers.length} Approvers
              </span>
            </div>

            {/* Timeline connector */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[1.1875rem] top-10 bottom-10 w-px bg-gradient-to-b from-emerald-500/50 via-white/10 to-white/5" />

              <div className="space-y-4">
                {approvers.map((approver, idx) => (
                  <div key={approver.id} className="relative pl-2">
                    <ApproverCard
                      approver={approver}
                      isCurrentUser={approver.id === 2 && !actionStatus}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Audit trail hint */}
            <div className="mt-4 flex items-center space-x-2 text-[10px] text-slate-500 border-t border-white/5 pt-4">
              <FaHistory size={10} />
              <span>All approval actions are logged with timestamp and user signature for audit compliance.</span>
            </div>
          </div>

          {/* Remarks Textarea */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-slate-400" />
              <h3 className="text-sm font-bold text-white">Approval Remarks</h3>
            </div>

            <textarea
              rows={4}
              className="w-full px-4 py-3 bg-[#0f172a]/70 border border-white/10 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150 text-sm resize-none"
              placeholder="Enter remarks, conditions, comments…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={!!actionStatus}
            />

            <p className="text-[10px] text-slate-500 mt-2">
              Remarks will be attached to the approval record and visible in the audit log.
            </p>
          </div>

          {/* Action Buttons */}
          {!actionStatus && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Reject */}
              <button
                onClick={() => setShowRejectConfirm(true)}
                className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 hover:text-rose-300 font-semibold rounded-xl text-sm transition duration-150 active:scale-[0.98] shadow-lg"
              >
                <FaTimes size={14} />
                <span>Reject</span>
              </button>

              {/* Approve */}
              <button
                onClick={handleApprove}
                className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-emerald-500/30 transition duration-150 active:scale-[0.98]"
              >
                <FaCheck size={14} />
                <span>Approve</span>
                <FaChevronRight size={11} />
              </button>
            </div>
          )}

          {/* Post-action reset hint */}
          {actionStatus && (
            <div className="text-center">
              <button
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-300 transition duration-150 underline underline-offset-2"
              >
                ← Reset demo state
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Quotation Summary ── */}
        <div className="space-y-5">

          {/* Quotation Card */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
            {/* Card gradient header */}
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-700/10 px-5 pt-5 pb-4 border-b border-white/8">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FaBuilding size={16} className="text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Selected Vendor</span>
                  <span className="text-sm font-bold text-white leading-tight">{QUOTATION.vendor}</span>
                </div>
              </div>
              <StarRating rating={QUOTATION.rating} />
            </div>

            {/* Metrics */}
            <div className="p-5 space-y-3">
              {[
                {
                  icon: FaFileInvoiceDollar,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10 border-emerald-500/20',
                  label: 'Grand Total',
                  value: QUOTATION.total,
                  bold: true,
                },
                {
                  icon: FaTruck,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10 border-blue-500/20',
                  label: 'Delivery Time',
                  value: QUOTATION.delivery,
                  bold: false,
                },
                {
                  icon: FaShieldAlt,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10 border-purple-500/20',
                  label: 'GST Rate',
                  value: QUOTATION.gst,
                  bold: false,
                },
                {
                  icon: FaClipboardCheck,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/20',
                  label: 'Category',
                  value: QUOTATION.category,
                  bold: false,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="flex items-center space-x-3 bg-[#0f172a]/50 border border-white/8 rounded-lg px-3 py-3 hover:border-white/15 transition duration-150"
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${m.bg}`}>
                    <m.icon size={13} className={m.color} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">{m.label}</span>
                    <span className={`text-sm font-bold ${m.bold ? 'text-emerald-400 font-mono' : 'text-white'}`}>
                      {m.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-[#1e293b]/50 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-1.5 h-5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-white">Workflow Info</h3>
            </div>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-start space-x-2">
                <FaCheckCircle size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                <span><span className="text-white font-semibold">L1 Review</span> completed by Rahul Mehta on May 20</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaHourglassHalf size={12} className="text-blue-400 shrink-0 mt-0.5" />
                <span><span className="text-white font-semibold">L2 Approval</span> pending — awaiting Finance Manager sign-off</span>
              </div>
              <div className="flex items-start space-x-2">
                <FaStamp size={12} className="text-slate-500 shrink-0 mt-0.5" />
                <span>PO will be auto-generated after L2 approval is granted</span>
              </div>
            </div>
          </div>

          {/* Urgency indicator */}
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 flex items-start space-x-3">
            <FaExclamationTriangle className="text-amber-400 shrink-0 mt-0.5" size={14} />
            <div>
              <p className="text-xs font-bold text-amber-300 mb-0.5">Action Required</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                L2 approval is overdue by <span className="text-amber-400 font-semibold">1 day</span>. Please review and act promptly to avoid procurement delays.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Reject Confirmation Modal ── */}
      {showRejectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] w-full max-w-md border border-white/20 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowRejectConfirm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition duration-150"
            >
              <FaTimes size={16} />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <FaExclamationTriangle className="text-rose-400" size={16} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Rejection</h3>
                <p className="text-xs text-slate-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-4 mb-5">
              <p className="text-xs text-slate-300 leading-relaxed">
                Rejecting this quotation will notify <span className="text-white font-semibold">Infra Supplies Pvt Ltd</span> and the procurement team. The RFQ will return to the draft stage.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-transparent border border-white/15 text-slate-300 hover:text-white hover:border-white/30 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg hover:shadow-rose-500/25 transition duration-150 flex items-center justify-center space-x-2"
              >
                <FaTimes size={13} />
                <span>Confirm Reject</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}