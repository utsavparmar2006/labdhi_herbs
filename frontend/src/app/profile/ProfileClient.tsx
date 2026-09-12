'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import { useCart } from '../../context/CartContext';
import { getCurrentUserProfile, updateUserProfile, changeUserPassword } from '../../services/api';
import { User } from '../../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Package,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Save,
  KeyRound,
  Building,
  Home,
  Clock,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Jammu & Kashmir',
  'Ladakh',
];

export default function ProfileClient() {
  const router = useRouter();
  const { items, cartCount, openCart, isCartOpen, closeCart, removeFromCart, updateQuantity } = useCart();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // User State
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Status & Feedback
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Load User Info
  const loadUser = async () => {
    setIsLoadingProfile(true);
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setName(parsed.name || '');
        setEmail(parsed.email || '');
        setPhone(parsed.phone || '');
        setAddress(parsed.address || '');
        setCity(parsed.city || '');
        setState(parsed.state || 'Gujarat');
        setPincode(parsed.pincode || '');
      }

      // Also try fetching fresh data from backend /api/v1/auth/me
      const res = await getCurrentUserProfile();
      if (res.success && res.data?.user) {
        const freshUser = res.data.user;
        setUser(freshUser);
        setName(freshUser.name || '');
        setEmail(freshUser.email || '');
        setPhone(freshUser.phone || '');
        setAddress(freshUser.address || '');
        setCity(freshUser.city || '');
        setState(freshUser.state || 'Gujarat');
        setPincode(freshUser.pincode || '');
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (e) {
      console.warn('Error fetching profile data', e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadUser();

    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setProfileErrorMsg('Full Name must be at least 2 characters.');
      return;
    }

    if (phone && !/^\d{10}$/.test(phone.trim().replace(/\D/g, ''))) {
      setProfileErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      setProfileErrorMsg('PIN code must be a 6-digit number.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
      const payload = {
        name: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      };

      const res = await updateUserProfile(payload);

      if (res.success && res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.dispatchEvent(new Event('authChange'));
        setProfileSuccessMsg('Your profile and default address were updated successfully!');
        setTimeout(() => setProfileSuccessMsg(''), 4000);
      } else {
        setProfileErrorMsg(res.message || 'Failed to update profile. Please try again.');
      }
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Server error while saving profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await changeUserPassword({
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setPasswordSuccessMsg('Password updated successfully! Keep it safe.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(''), 4000);
      } else {
        setPasswordErrorMsg(res.message || 'Failed to change password. Check your current password.');
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Server error while updating password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'LH';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] flex flex-col font-sans selection:bg-[#D4A373]/30">
      {/* Universal Header */}
      <Header
        cartCount={cartCount}
        onOpenCart={openCart}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#71846C] mb-6">
          <Link href="/" className="hover:text-[#1F3A2E] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />
          <span className="text-[#1F3A2E] font-medium">My Account</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />
          <span className="text-[#1F3A2E] font-bold">Profile Settings</span>
        </nav>

        {/* Auth Check State */}
        {isLoadingProfile ? (
          <div className="bg-white rounded-3xl p-12 border border-[#EFE9DD] shadow-sm text-center my-8">
            <div className="inline-block w-10 h-10 border-3 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-[#1F3A2E]">Loading your profile details...</p>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFE9DD] shadow-lg text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-[#F8F6F0] border border-[#EFE9DD] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#1F3A2E]">
              <Lock className="w-8 h-8 text-[#D4A373]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1F3A2E] mb-2">
              Sign In to View Your Profile
            </h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Please log in with your verified email to edit your personal details, default shipping address, and password settings.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-[#D4A373]" />
                <span>Sign In or Register</span>
              </button>
              <Link
                href="/"
                className="px-6 py-3 rounded-full bg-[#F8F6F0] hover:bg-[#EFE9DD] text-[#1F3A2E] font-bold text-sm border border-[#EFE9DD] transition-all flex items-center justify-center"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Top User Overview Banner */}
            <div className="bg-gradient-to-r from-[#1F3A2E] to-[#2C5241] rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#D4A373] text-[#1F3A2E] font-serif font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                        {user.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Customer
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#EFE9DD]/80 mt-1 flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>{user.email}</span>
                    </p>
                    {user.phone && (
                      <p className="text-xs sm:text-sm text-[#EFE9DD]/80 mt-0.5 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>+91 {user.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Action Links */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href="/orders"
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 backdrop-blur-xs"
                  >
                    <Package className="w-4 h-4 text-[#D4A373]" />
                    <span>View My Orders</span>
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="px-4 py-2.5 rounded-full bg-[#D4A373] hover:bg-[#c39263] text-[#1F3A2E] font-bold text-xs transition-all flex items-center gap-2 shadow-md"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'profile'
                      ? 'bg-white text-[#1F3A2E] shadow-sm'
                      : 'text-[#EFE9DD] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Personal Info & Address</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'security'
                      ? 'bg-white text-[#1F3A2E] shadow-sm'
                      : 'text-[#EFE9DD] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password & Security</span>
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Form Area (2 Columns) */}
              <div className="lg:col-span-2 space-y-6">
                {activeTab === 'profile' ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    {/* Feedback Messages */}
                    {profileSuccessMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{profileSuccessMsg}</span>
                      </motion.div>
                    )}

                    {profileErrorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-3 shadow-xs"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{profileErrorMsg}</span>
                      </motion.div>
                    )}

                    {/* Section 1: Personal Details */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9DD] shadow-sm">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EFE9DD]">
                        <div className="w-9 h-9 rounded-xl bg-[#F8F6F0] flex items-center justify-center text-[#1F3A2E] border border-[#EFE9DD]">
                          <UserIcon className="w-4 h-4 text-[#D4A373]" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[#1F3A2E]">
                            Personal Information
                          </h2>
                          <p className="text-xs text-slate-500">
                            Update your name and contact phone number
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="e.g. Ramesh Patel"
                              required
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            Mobile Number (WhatsApp)
                          </label>
                          <div className="relative flex">
                            <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-[#EFE9DD] bg-slate-100 text-slate-600 text-xs font-semibold">
                              +91
                            </span>
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="9328349328"
                              maxLength={10}
                              className="w-full pl-3 pr-4 py-2.5 rounded-r-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Used for order tracking and delivery SMS</p>
                        </div>

                        {/* Email (Read Only) */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            Email Address (Registered Account Identifier)
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={email}
                              disabled
                              readOnly
                              className="w-full pl-9 pr-24 py-2.5 rounded-xl border border-[#EFE9DD] bg-slate-100 text-xs text-slate-600 cursor-not-allowed"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <span className="absolute right-3 top-2 px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Email address is permanently tied to your orders and account security.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Default Delivery Address */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9DD] shadow-sm">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EFE9DD]">
                        <div className="w-9 h-9 rounded-xl bg-[#F8F6F0] flex items-center justify-center text-[#1F3A2E] border border-[#EFE9DD]">
                          <Home className="w-4 h-4 text-[#D4A373]" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[#1F3A2E]">
                            Default Delivery Address
                          </h2>
                          <p className="text-xs text-slate-500">
                            Pre-fills your shipping address on rapid checkout
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Street Address */}
                        <div>
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            House / Flat No., Apartment / Society, Street Address
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="e.g. 402, Shivalik Apartment, Ghod Dod Road"
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          </div>
                        </div>

                        {/* City & State & Pincode */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                              City / Town
                            </label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. Surat"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                              State
                            </label>
                            <select
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                              PIN Code (6 digits)
                            </label>
                            <input
                              type="text"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="e.g. 395007"
                              maxLength={6}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-8 py-3 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        {isSavingProfile ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-[#D4A373]" />
                            <span>Save Profile Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Security & Password Tab */
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    {/* Feedback Messages */}
                    {passwordSuccessMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs"
                      >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{passwordSuccessMsg}</span>
                      </motion.div>
                    )}

                    {passwordErrorMsg && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-3 shadow-xs"
                      >
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span>{passwordErrorMsg}</span>
                      </motion.div>
                    )}

                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9DD] shadow-sm">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#EFE9DD]">
                        <div className="w-9 h-9 rounded-xl bg-[#F8F6F0] flex items-center justify-center text-[#1F3A2E] border border-[#EFE9DD]">
                          <KeyRound className="w-4 h-4 text-[#D4A373]" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-[#1F3A2E]">
                            Change Password
                          </h2>
                          <p className="text-xs text-slate-500">
                            Ensure your account is protected with a secure password
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 max-w-lg">
                        {/* Current Password */}
                        <div>
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            Current Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPw ? 'text' : 'password'}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter existing password"
                              required
                              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            New Password (minimum 6 characters) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPw ? 'text' : 'password'}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter strong new password"
                              required
                              minLength={6}
                              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <button
                              type="button"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-xs font-bold text-[#1F3A2E] mb-1.5">
                            Confirm New Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPw ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Repeat new password"
                              required
                              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/40 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPw(!showConfirmPw)}
                              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Submit Password Button */}
                      <div className="pt-6 mt-4 border-t border-[#EFE9DD]">
                        <button
                          type="submit"
                          disabled={isSavingPassword}
                          className="px-8 py-3 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          {isSavingPassword ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound className="w-4 h-4 text-[#D4A373]" />
                              <span>Update Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Right Sidebar (1 Column) */}
              <div className="space-y-6">
                {/* Orders Shortcut Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#EFE9DD] shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] flex items-center justify-center text-[#1F3A2E] border border-[#EFE9DD] mb-4">
                    <Package className="w-6 h-6 text-[#D4A373]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1F3A2E] mb-1">
                    My Order History
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Track live deliveries, view GST invoices, and reorder your favorite herbal remedies.
                  </p>
                  <Link
                    href="/orders"
                    className="w-full py-2.5 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <span>View All Orders</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                  </Link>
                </div>

                {/* Ayurvedic Guarantee Card */}
                <div className="bg-[#F8F6F0] rounded-3xl p-6 border border-[#EFE9DD]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1F3A2E] mb-2">
                    <Sparkles className="w-4 h-4 text-[#D4A373]" />
                    <span>Labdhi Authentic Care</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-2 mt-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>100% pure herbs handcrafted in Surat, Gujarat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Zero toxic chemicals, parabens, or mineral oils</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>Safe tamper-proof packaging & swift dispatch</span>
                    </li>
                  </ul>
                </div>

                {/* Helpline / Support Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#EFE9DD] shadow-sm">
                  <h4 className="text-xs font-bold text-[#1F3A2E] uppercase tracking-wider mb-2">
                    Herbal Support Helpline
                  </h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Have questions about dosages, order status, or Ayurvedic formulations?
                  </p>
                  <a
                    href="tel:+919328349328"
                    className="inline-flex items-center gap-2 text-xs font-bold text-[#1F3A2E] hover:text-[#D4A373] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>+91 93283 49328</span>
                  </a>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Mon - Sat: 9:30 AM to 7:00 PM IST
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          router.push(`/product/${p.id}`);
        }}
      />
    </div>
  );
}
