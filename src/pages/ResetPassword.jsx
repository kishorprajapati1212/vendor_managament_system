import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import {
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaKey,
  FaEnvelope,
  FaShieldAlt,
} from 'react-icons/fa';

/* ─── OTP Input ─────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const digits = 6;
  const chars = value.split('');

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '');
    const arr = value.split('');
    arr[idx] = val.slice(-1);
    onChange(arr.join(''));
    // Auto-advance
    if (val && idx < digits - 1) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !chars[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, digits);
    onChange(pasted.padEnd(digits, '').slice(0, digits));
    e.preventDefault();
    document.getElementById(`otp-${Math.min(pasted.length, digits - 1)}`)?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length: digits }).map((_, idx) => (
        <input
          key={idx}
          id={`otp-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={chars[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={`w-11 h-12 text-center text-lg font-bold rounded-xl border bg-[#0f172a]/70 text-white transition duration-150 focus:outline-none ${
            chars[idx]
              ? 'border-blue-500 ring-1 ring-blue-500/40 shadow-blue-500/10 shadow-md'
              : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40'
          }`}
        />
      ))}
    </div>
  );
}

/* ─── Password Strength ─────────────────────────── */
function PasswordStrength({ password }) {
  const rules = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
    { label: 'Special character', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = rules.filter((r) => r.pass).length;
  const levelMap = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colorMap = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
  const textMap  = ['', 'text-rose-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400'];

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              n <= score ? colorMap[score] : 'bg-white/10'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold ${textMap[score] || 'text-slate-500'}`}>
          {levelMap[score] || 'Enter password'}
        </span>
        <div className="flex gap-3">
          {rules.map((r) => (
            <span key={r.label} className={`text-[9px] ${r.pass ? 'text-emerald-400' : 'text-slate-600'}`}>
              {r.pass ? '✓' : '○'} {r.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────── */
export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail]               = useState(location.state?.email || '');
  const [otp, setOtp]                   = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [status, setStatus]             = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errors, setErrors]             = useState({});

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address.';
    if (otp.length !== 6) e.otp = 'OTP must be exactly 6 digits.';
    if (!newPassword) e.newPassword = 'New password is required.';
    else if (newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters.';
    if (!confirmPassword) e.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus('loading');
    try {
      const res = await resetPassword(email.trim(), otp, newPassword);
      if (res?.data?.success) {
        setStatus('success');
        // Redirect after 3s
        setTimeout(() => navigate('/login', { state: { successMessage: 'Password reset successfully. Please log in.' } }), 3000);
      } else {
        setErrors({ form: res?.data?.message || 'Reset failed. Please try again.' });
        setStatus('error');
      }
    } catch (err) {
      setErrors({ form: err?.response?.data?.message || 'Reset failed. Please try again.' });
      setStatus('error');
    }
  };

  /* ── Field helper ── */
  const fieldCls = (hasErr) =>
    `w-full px-4 py-3 bg-[#0f172a]/60 border text-white rounded-xl placeholder-slate-500 focus:outline-none focus:ring-1 transition duration-150 sm:text-sm ${
      hasErr
        ? 'border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30'
        : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/40'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative">

        {/* Back link */}
        <Link
          to="/forgot-password"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition duration-150 group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform duration-150" />
          <span>Back</span>
        </Link>

        {/* Card */}
        <div className="bg-[#1e293b]/80 backdrop-blur-md p-8 rounded-2xl border border-white/15 shadow-2xl">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
              <FaKey size={26} className="text-purple-400" />
            </div>
          </div>

          {/* ── Success State ── */}
          {status === 'success' ? (
            <div className="space-y-5 text-center">
              <div className="flex flex-col items-center space-y-4 bg-emerald-500/8 border border-emerald-500/25 rounded-xl p-6">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <FaCheckCircle size={28} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-300">Password reset successfully!</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Your password has been updated. Redirecting you to the login page in a moment…
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-[progress_3s_linear_forwards]" style={{ width: '100%', animationTimingFunction: 'linear' }} />
              </div>

              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 text-sm font-semibold transition duration-150 hover:underline"
              >
                <span>Go to Login now</span>
              </Link>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
                <p className="mt-1.5 text-sm text-slate-400">Enter the OTP sent to your email and choose a new password.</p>
              </div>

              {/* Form-level error */}
              {errors.form && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-sm text-center">
                  {errors.form}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <FaEnvelope size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                    placeholder="name@company.com"
                    className={`${fieldCls(errors.email)} pl-11`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>}
              </div>

              {/* OTP */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 text-center">
                  Enter 6-Digit OTP
                </label>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setErrors((p) => ({ ...p, otp: '' })); }} />
                {errors.otp && <p className="text-[11px] text-rose-400 mt-2 text-center">{errors.otp}</p>}
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  Check your inbox · Demo OTP:{' '}
                  <button
                    type="button"
                    onClick={() => setOtp('123456')}
                    className="font-mono font-bold text-amber-400 hover:text-amber-300 transition duration-150"
                  >
                    123456
                  </button>
                </p>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <FaLock size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                    placeholder="Min. 8 characters"
                    className={`${fieldCls(errors.newPassword)} pl-11 pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition duration-150"
                  >
                    {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.newPassword}</p>}
                <PasswordStrength password={newPassword} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">Confirm Password</label>
                <div className="relative">
                  <FaShieldAlt size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                    placeholder="Re-enter new password"
                    className={`${fieldCls(errors.confirmPassword)} pl-11 pr-11 ${
                      confirmPassword && newPassword === confirmPassword ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/30' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition duration-150"
                  >
                    {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
                    <FaCheckCircle size={10} />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-purple-500/25 transition duration-150 active:scale-[0.98] mt-2"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Resetting Password…</span>
                  </>
                ) : (
                  <>
                    <FaLock size={13} />
                    <span>Reset Password</span>
                  </>
                )}
              </button>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs pt-1">
                <Link to="/login" className="text-slate-400 hover:text-white transition duration-150 hover:underline">
                  Back to Login
                </Link>
                <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 font-semibold transition duration-150 hover:underline">
                  Resend OTP
                </Link>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">VendorBridge ERP · Secure Authentication</p>
      </div>
    </div>
  );
}
