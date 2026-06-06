import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerApi } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'Admin',
    country: '',
    additionalInfo: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
        phoneNumber: form.phoneNumber,
        country: form.country,
        additionalInfo: form.additionalInfo
      };
      await registerApi(payload);
      
      // Reset form fields
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'Admin',
        country: '',
        additionalInfo: ''
      });

      // Redirect to login page with pre-filled state
      navigate('/login', {
        state: {
          email: form.email,
          password: form.password,
          successMessage: 'Registration Successful. Please login with your credentials.'
        }
      });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl w-full relative">
        {/* Main Card Container */}
        <div className="bg-[#1e293b]/80 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl relative mt-16">
          
          {/* Top Center Profile Photo Placeholder */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-[#0f172a] bg-[#1e293b] overflow-hidden shadow-xl flex items-center justify-center">
              <img 
                src="/erp_avatar.png" 
                alt="New User Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
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
              Create New User
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`p-4 rounded-lg text-sm text-center border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {message.text}
              </div>
            )}

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                    placeholder="john.doe@company.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                  >
                    <option value="Admin" className="bg-[#1e293b] text-white">Admin</option>
                    <option value="Officer" className="bg-[#1e293b] text-white">Officer</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Additional Information
              </label>
              <textarea
                value={form.additionalInfo}
                onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
                rows="4"
                className="appearance-none relative block w-full px-4 py-3 bg-[#0f172a]/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 sm:text-sm resize-none"
                placeholder="Enter any additional user profile information, security notes, or department details here..."
              ></textarea>
            </div>

            {/* Register Button */}
            <div className="flex flex-col items-center space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f172a] focus:ring-blue-500 transition duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register User'}
              </button>
              
              <div className="text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition duration-150 hover:underline">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
