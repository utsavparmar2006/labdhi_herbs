'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { forgotPassword, resetPassword } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form states
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Forgot & Reset Password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [devOtpBadge, setDevOtpBadge] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend cooldown timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

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

  // Step 1: Send OTP to email
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await forgotPassword(forgotEmail.trim());

      if (!res.success) {
        throw new Error(res.message || 'Failed to send password reset code.');
      }

      if (res.devOtp) {
        setDevOtpBadge(res.devOtp);
      }

      setSuccessMessage(res.message || 'Verification code sent to your email.');
      setResendCooldown(45); // 45 seconds cooldown

      setTimeout(() => {
        setIsLoading(false);
        setActiveTab('reset');
      }, 600);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Could not send verification code.');
    }
  };

  // Step 2: Reset password using OTP & auto-login
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    if (resetNewPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage('Passwords do not match. Please check and retype.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await resetPassword(forgotEmail.trim(), resetOtp.trim(), resetNewPassword);

      if (!res.success) {
        throw new Error(res.message || 'Failed to reset password.');
      }

      // Automatically store tokens and update user session
      if (res.data?.accessToken && typeof window !== 'undefined') {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('authChange'));
      }

      setSuccessMessage('Password reset successfully! Logging you in...');

      setTimeout(() => {
        setIsLoading(false);
        onClose();
        // Reset states
        setActiveTab('login');
        setForgotEmail('');
        setResetOtp('');
        setResetNewPassword('');
        setResetConfirmPassword('');
        setDevOtpBadge('');
      }, 1500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to reset password.');
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

        {/* Tab Headers (Shown for Login / Register, Replaced with Breadcrumb for Forgot/Reset) */}
        {activeTab === 'login' || activeTab === 'register' ? (
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
        ) : (
          <div className="px-6 py-4 border-b border-[#EFE9DD] bg-white flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="text-xs font-bold text-[#1F3A2E] hover:text-[#D4A373] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Account Recovery
            </span>
          </div>
        )}

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium leading-relaxed">
              ⚠️ {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold leading-relaxed flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* VIEW 1: LOGIN FORM */}
          {activeTab === 'login' && (
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
                
                {/* Fixed Interactive Forgot Password Button */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    if (loginEmail) setForgotEmail(loginEmail);
                    setActiveTab('forgot');
                  }}
                  className="text-[#1F3A2E] hover:underline font-semibold cursor-pointer transition-colors"
                >
                  Forgot Password?
                </button>
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
          )}

          {/* VIEW 2: REGISTER FORM */}
          {activeTab === 'register' && (
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

          {/* VIEW 3: FORGOT PASSWORD (STEP 1 - EMAIL) */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center space-y-1.5 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#1F3A2E]/10 border border-[#1F3A2E]/20 text-[#1F3A2E] flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6 text-[#1F3A2E]" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1A201C]">Forgot Password?</h4>
                <p className="text-xs text-slate-500 font-light max-w-xs mx-auto leading-relaxed">
                  Enter your registered account email and we will send you a 6-digit verification code to reset your password.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email (e.g. name@example.com)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-[#1F3A2E] transition-colors cursor-pointer"
                >
                  Remember your password? <span className="text-[#1F3A2E] underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 4: RESET PASSWORD (STEP 2 - OTP & NEW PASSWORD) */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="text-center space-y-1 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-700" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-[#1A201C]">Set New Password</h4>
                <p className="text-xs text-slate-500 font-light">
                  Code sent to <span className="font-semibold text-slate-700">{forgotEmail}</span>
                </p>
              </div>

              {/* Dev Mode OTP Quick-Fill Badge */}
              {devOtpBadge && (
                <div
                  onClick={() => setResetOtp(devOtpBadge)}
                  className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                  title="Click to fill code"
                >
                  <span>Verification Code: <strong className="font-mono text-sm tracking-wider">{devOtpBadge}</strong></span>
                  <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Click to fill
                  </span>
                </div>
              )}

              {/* 6-Digit OTP Code Input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">6-Digit Code</label>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleForgotSubmit}
                    className="text-[11px] font-semibold text-[#1F3A2E] hover:underline disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password &amp; Sign In</span>
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
