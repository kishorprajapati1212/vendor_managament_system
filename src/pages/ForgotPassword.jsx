import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import {
  FaEnvelope,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
  FaShieldAlt,
} from 'react-icons/fa';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await forgotPassword(email.trim());
      if (res?.data?.success) {
        setStatus('success');
      } else {
        setErrorMsg(res?.data?.message || 'Something went wrong. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Unable to send OTP. Please try again.');
      setStatus('error');
    }
  };

  const handleProceedToReset = () => {
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative">

        {/* Back to Login */}
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition duration-150 group"
        >
          <FaArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform duration-150" />
          <span>Back to Login</span>
        </Link>

        {/* Card */}
        <div className="bg-[#1e293b]/80 backdrop-blur-md p-8 rounded-2xl border border-white/15 shadow-2xl">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <FaShieldAlt size={28} className="text-blue-400" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Forgot Password?</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Enter your registered email address and we'll send you a one-time password to reset your account.
            </p>
          </div>

          {/* ── Success State ── */}
          {status === 'success' ? (
            <div className="space-y-5">
              <div className="flex flex-col items-center space-y-4 bg-emerald-500/8 border border-emerald-500/25 rounded-xl p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <FaCheckCircle size={28} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-300">OTP sent successfully!</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    An OTP has been sent to{' '}
                    <span className="text-white font-semibold">{email}</span>.
                    Check your inbox and enter the OTP on the next screen.
                  </p>
                </div>
              </div>

              {/* Demo hint */}
              <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
                <p className="text-[11px] text-amber-400 text-center leading-relaxed">
                  <span className="font-bold">Demo mode:</span> Use OTP{' '}
                  <span className="font-mono font-bold text-white">123456</span> on the next screen.
                </p>
              </div>

              <button
                onClick={handleProceedToReset}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition duration-150 active:scale-[0.98]"
              >
                <span>Enter OTP &amp; Reset Password</span>
                <FaArrowLeft size={11} className="rotate-180" />
              </button>

              <p className="text-center text-xs text-slate-500">
                Didn't receive it?{' '}
                <button
                  onClick={() => setStatus('idle')}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition duration-150 hover:underline"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          ) : (
            /* ── Form State ── */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Error Banner */}
              {status === 'error' && errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#0f172a]/60 border border-white/10 text-white rounded-xl placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition duration-150 sm:text-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5">
                  Must match the email used during registration.
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm shadow-lg hover:shadow-blue-500/25 transition duration-150 active:scale-[0.98]"
              >
                {status === 'loading' ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    <span>Sending OTP…</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={13} />
                    <span>Send OTP</span>
                  </>
                )}
              </button>

              {/* Footer Links */}
              <div className="flex items-center justify-between text-xs pt-1">
                <Link to="/login" className="text-slate-400 hover:text-white transition duration-150 hover:underline">
                  Back to Login
                </Link>
                <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition duration-150 hover:underline">
                  Create account
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Brand */}
        <p className="text-center text-xs text-slate-600 mt-6">VendorBridge ERP · Secure Authentication</p>
      </div>
    </div>
  );
}
