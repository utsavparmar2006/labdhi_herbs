'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OriginalTransparentLogo from '../../../components/OriginalTransparentLogo';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminLoginClient() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Prefill remembered email if saved
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('admin_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid admin email or password.');
      }

      // Store Auth Tokens & User Profile
      if (typeof window !== 'undefined') {
        if (data.data?.accessToken) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.data.user));
          window.dispatchEvent(new Event('authChange'));
        }

        if (rememberMe) {
          localStorage.setItem('admin_remembered_email', email);
        } else {
          localStorage.removeItem('admin_remembered_email');
        }
      }

      setSuccessMessage('Authentication successful! Opening dashboard...');
      
      setTimeout(() => {
        setIsLoading(false);
        router.push('/admin/dashboard');
      }, 1000);

    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Unable to connect to server. Please check backend connection.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#101F18] text-[#1A201C] flex items-center justify-center font-sans selection:bg-[#1F3A2E] selection:text-white">
      
      {/* Container Box */}
      <div className="w-full min-h-screen lg:min-h-[700px] lg:max-w-5xl lg:rounded-3xl lg:my-8 bg-white border border-[#EFE9DD] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Panel: Desktop Brand & Visual Section (50% Width) */}
        <div className="lg:col-span-6 relative bg-[#14261E] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1F3A2E] via-[#14261E] to-[#0A140F] opacity-90" />
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
            alt="Labdhi Herbs Admin Workshop"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20"
          />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-6">
            <div className="inline-block bg-white px-3.5 py-2 rounded-2xl shadow-sm border border-white/20">
              <OriginalTransparentLogo className="h-10 w-auto" isDarkBackground={false} />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal 2.0</span>
              </div>
            </div>
          </div>

          {/* Middle Brand Message */}
          <div className="relative z-10 space-y-3 py-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">
              Administrative Control & Operations Portal
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70 font-light leading-relaxed max-w-sm">
              Manage inventory, customer orders, store formulations, and content metrics securely.
            </p>
          </div>

          {/* Bottom Security Footer */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60 font-medium">
            <span>Labdhi Herbs © 2026</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#D4A373]" /> 256-bit Encrypted
            </span>
          </div>

        </div>

        {/* Right Panel: Login Form (50% Width) */}
        <div className="lg:col-span-6 bg-white p-8 sm:p-14 flex flex-col justify-center space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-left">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-light">
              Please enter your administrator credentials to sign in.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-3 leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 leading-relaxed animate-in fade-in duration-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@labdhiherbs.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]/20 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]/20 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                />
                <span>Remember me</span>
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link sent to registered admin email address.');
                }}
                className="text-[#1F3A2E] hover:underline font-bold"
              >
                Forgot Password?
              </a>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Admin</span>
                  <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                </>
              )}
            </button>

          </form>

            {/* Default Admin Credentials Helper */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-left text-[11px] text-amber-900 space-y-1">
              <span className="font-bold text-amber-950 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" /> Default Admin Login:
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-0.5">
                <div>Email: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200 text-slate-800">admin@labdhiherbs.com</code></div>
                <div>Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-200 text-slate-800">Admin@123456</code></div>
              </div>
            </div>

            {/* Footer Security Note */}
            <div className="pt-2 border-t border-[#EFE9DD] text-center">
              <span className="text-[11px] text-slate-400 font-light flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Restricted area • Authorized Labdhi Herbs administrators only.
              </span>
            </div>

        </div>

      </div>

    </div>
  );
}
