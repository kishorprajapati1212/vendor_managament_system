import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState(location.state?.password || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.successMessage || '');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative subtle background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative">
        {/* Main Login Card */}
        <div className="bg-[#1e293b]/80 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl relative mt-16">
          
          {/* Top Center Profile Image Placeholder */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-[#0f172a] bg-[#1e293b] overflow-hidden shadow-xl flex items-center justify-center">
              <img 
                src="/erp_avatar.png" 
                alt="ERP User Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="pt-16 text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              VendorBridge ERP
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to manage your enterprise operations
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm text-center">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 text-sm text-center">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Username / Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-white/10 bg-[#0f172a]/50 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-blue-400 hover:text-blue-300 hover:underline transition duration-150"
              >
                Forgot Password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-blue-500 transition duration-150 active:scale-[0.98]"
              >
                Sign in
              </button>
            </div>

            <div className="text-center text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition duration-150 hover:underline">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}