import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Lock, Building2, ArrowRight, UserPlus } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', userId: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post(isRegister ? '/auth/register' : '/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex">

      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0F1923] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex items-center justify-center">
              <Building2 size={16} color="white" />
            </div>
            <span className="text-white font-semibold tracking-wide text-sm">AttendTrack</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 style={{ fontFamily: "'DM Serif Display', serif" }}
            className="text-5xl text-white leading-tight mb-6">
            Smart<br />Attendance<br />Tracking
          </h1>
          <p className="text-[#6B7A8D] text-sm leading-relaxed max-w-xs">
            GPS-verified check-ins with photo confirmation. Accurate, tamper-proof, effortless.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['GPS Verified', 'Location pinned at shop'], ['Selfie Proof', 'Camera confirmation'], ['Daily Logs', 'History & reports']].map(([t, s]) => (
              <div key={t} className="border border-[#1E2D3D] rounded-xl p-4">
                <p className="text-white text-sm font-medium mb-1">{t}</p>
                <p className="text-[#4A5568] text-xs">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-[#2D3748] text-xs">© 2025 AttendTrack</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-[#0F1923] rounded-lg flex items-center justify-center">
              <Building2 size={14} color="white" />
            </div>
            <span className="font-semibold tracking-wide text-sm text-[#0F1923]">AttendTrack</span>
          </div>

          <h2 className="text-2xl font-semibold text-[#0F1923] mb-1">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-sm text-[#6B7A8D] mb-8">
            {isRegister ? 'Register to start marking attendance' : 'Sign in to your employee account'}
          </p>

          <form onSubmit={submit} className="space-y-4" autoComplete="off">
  
  <input type="text" name="fakeuser" style={{ display: 'none' }} readOnly />
  <input type="password" name="fakepass" style={{ display: 'none' }} readOnly />

  {isRegister && (
    <div className="relative">
      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
      <input
        name="name"
        placeholder="Full name"
        value={form.name}
        onChange={handle}
        required
        autoComplete="new-password"
        className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#0F1923] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition" />
    </div>
  )}

  <div className="relative">
    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
    <input
      name="userId"
      placeholder="Employee ID"
      value={form.userId}
      onChange={handle}
      required
      autoComplete="new-password"
      className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#0F1923] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition" />
  </div>

  <div className="relative">
    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
    <input
      name="password"
      type={showPass ? 'text' : 'password'}
      placeholder="Password"
      value={form.password}
      onChange={handle}
      required
      autoComplete="new-password"
      className="w-full pl-10 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm text-[#0F1923] placeholder-[#9CA3AF] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition" />
    <button type="button" onClick={() => setShowPass(!showPass)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  </div>

  {error && (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
      {error}
    </div>
  )}

  <button type="submit" disabled={loading}
    className="w-full bg-[#0F1923] hover:bg-[#1a2a3a] disabled:opacity-50 text-white rounded-xl py-3 text-sm font-medium transition flex items-center justify-center gap-2">
    {loading ? (
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    ) : (
      <>
        {isRegister ? <UserPlus size={15} /> : <ArrowRight size={15} />}
        {isRegister ? 'Create Account' : 'Sign In'}
      </>
    )}
  </button>
</form>

          <p className="text-center text-sm text-[#6B7A8D] mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition">
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}