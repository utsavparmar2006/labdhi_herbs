'use me';
'use client';

import { useState } from 'react';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Store Auth Credentials
      if (data.data?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.dispatchEvent(new Event('authChange'));
      }

      setSuccessMessage('Login successful! Welcome back.');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Server connection error. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const fullName = `${registerFirstName.trim()} ${registerLastName.trim()}`.trim();

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email: registerEmail,
          phone: registerPhone,
          password: registerPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      if (data.data?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        window.dispatchEvent(new Event('authChange'));
      }

      setSuccessMessage('Account created successfully!');
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Server connection error. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#F8F6F0] rounded-3xl overflow-hidden shadow-2xl border border-[#EFE9DD] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Headers */}
        <div className="flex border-b border-[#EFE9DD] bg-white">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-4 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'text-[#1F3A2E] border-b-2 border-[#1F3A2E] bg-[#F8F6F0]/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Sign In to Account
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-4 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'text-[#1F3A2E] border-b-2 border-[#1F3A2E] bg-[#F8F6F0]/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold leading-relaxed">
              ✓ {successMessage}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-6">
                <h4 className="font-serif text-2xl font-bold text-[#1A201C]">Welcome Back</h4>
                <p className="text-xs text-slate-500 font-light">Sign in to view orders and manage your account</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="rounded text-[#1F3A2E]" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="text-[#1F3A2E] hover:underline font-semibold">Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <h4 className="font-serif text-2xl font-bold text-[#1A201C]">Join Labdhi Herbs</h4>
                <p className="text-xs text-slate-500 font-light">Create an account for quick checkout and offers</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={registerFirstName}
                    onChange={(e) => setRegisterFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={registerLastName}
                    onChange={(e) => setRegisterLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Mobile Number</label>
                <input
                  type="tel"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Create password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Your information is 100% secure with Labdhi Herbs.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
