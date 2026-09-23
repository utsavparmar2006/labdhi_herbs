'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  User,
  Phone,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Send,
  ArrowRight,
  ShieldCheck,
  Tag,
  MessageCircle,
} from 'lucide-react';
import { subscribeToNewsletter } from '../services/api';

interface NewsletterSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  source?: string;
}

export default function NewsletterSubscribeModal({
  isOpen,
  onClose,
  initialEmail = '',
  source = 'footer_newsletter',
}: NewsletterSubscribeModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponCode, setCouponCode] = useState('WELCOME10');
  const [copied, setCopied] = useState(false);

  // Sync initialEmail when opened
  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Check if user is already subscribed when modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('labdhi_subscribed');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.subscribed) {
            setCouponCode(parsed.couponCode || 'WELCOME10');
            setName(parsed.name || '');
            setIsSuccess(true);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  // Reset states when closed
  const handleModalClose = () => {
    setIsSuccess(false);
    setErrorMessage('');
    setCopied(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit WhatsApp phone number');
      return;
    }

    setLoading(true);

    try {
      const res = await subscribeToNewsletter({
        name: name.trim(),
        email: email.trim(),
        phone: cleanDigits,
        source,
      });

      if (res.success) {
        const assignedCoupon = res.couponCode || 'WELCOME10';
        setCouponCode(assignedCoupon);
        setIsSuccess(true);

        try {
          localStorage.setItem(
            'labdhi_subscribed',
            JSON.stringify({
              subscribed: true,
              name: name.trim(),
              email: email.trim(),
              couponCode: assignedCoupon,
              subscribedAt: new Date().toISOString(),
            })
          );
          window.dispatchEvent(new Event('labdhi_newsletter_subscribed'));
        } catch (e) {
          // ignore
        }
      } else {
        setErrorMessage(res.message || 'Subscription failed. Please verify your details.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleModalClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#F8F6F0] rounded-3xl shadow-2xl border border-[#EFE9DD] overflow-hidden z-10 my-8"
        >
          {/* Header Visual Bar */}
          <div className="bg-[#14261E] text-white px-6 sm:px-8 pt-7 pb-6 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#D4A373]/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Labdhi Herbal Club</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              {isSuccess ? 'Welcome to Our Herbal Family! 🌿' : 'Subscribe for Special Herbal Offers & Wellness Tips'}
            </h3>
            <p className="text-xs text-emerald-100/75 mt-1 font-light leading-relaxed">
              {isSuccess
                ? 'Your exclusive welcome voucher is ready to use at checkout.'
                : 'Enter your details below to receive personalized offers on WhatsApp & Email.'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {!isSuccess ? (
              /* Subscription Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Benefits Badges */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#14261E] font-medium pb-2">
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#EFE9DD]">
                    <Tag className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />
                    <span>Instant 10% Discount</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#EFE9DD]">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>WhatsApp Deals & Tips</span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14261E] uppercase tracking-wider block">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Pooja Mehta"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EFE9DD] text-[#14261E] placeholder-slate-400 text-xs focus:outline-none focus:border-[#1F3A2E] focus:ring-1 focus:ring-[#1F3A2E]"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14261E] uppercase tracking-wider block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. pooja@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EFE9DD] text-[#14261E] placeholder-slate-400 text-xs focus:outline-none focus:border-[#1F3A2E] focus:ring-1 focus:ring-[#1F3A2E]"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#14261E] uppercase tracking-wider block">
                    WhatsApp Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl bg-white border border-[#EFE9DD] overflow-hidden focus-within:border-[#1F3A2E] focus-within:ring-1 focus-within:ring-[#1F3A2E]">
                    <div className="px-3.5 py-2.5 bg-slate-50 border-r border-[#EFE9DD] text-xs font-bold text-[#14261E] flex items-center gap-1.5 shrink-0">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={12}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="98765 43210"
                      className="w-full px-3.5 py-2.5 bg-transparent text-[#14261E] placeholder-slate-400 text-xs focus:outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    We will send your voucher code & ayurvedic advice on WhatsApp. No spam ever.
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Activating Your Gift...</span>
                    </>
                  ) : (
                    <>
                      <span>Get 10% Discount &amp; Subscribe</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Privacy Protected • Unsubscribe Anytime</span>
                </div>
              </form>
            ) : (
              /* Success & Coupon Display */
              <div className="space-y-5 text-center py-2">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-[#14261E]">
                    Namaste, {name}! 🎉
                  </h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    You have successfully joined the Labdhi Herbs family. We have registered your details for both Email &amp; WhatsApp wellness updates.
                  </p>
                </div>

                {/* Discount Code Box */}
                <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] space-y-2 shadow-sm">
                  <span className="text-[11px] font-bold text-[#B58A5A] uppercase tracking-wider block">
                    Your 10% OFF Welcome Coupon:
                  </span>

                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-2xl font-extrabold tracking-widest text-[#14261E] bg-[#F8F6F0] px-4 py-2 rounded-xl border border-[#EFE9DD]">
                      {couponCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCoupon}
                      className="px-3.5 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Action Button: Continue Shopping */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-full py-3 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Start Shopping With 10% OFF</span>
                    <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
