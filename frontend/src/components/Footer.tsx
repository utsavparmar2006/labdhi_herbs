'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OriginalTransparentLogo from './OriginalTransparentLogo';
import NewsletterSubscribeModal from './NewsletterSubscribeModal';
import AuthModal from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube,
  Twitter,
  Leaf, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogIn,
  Lock,
  X,
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { checkSubscriberStatus, getCategories } from '../services/api';
import { MainCategory } from '../types';

export default function Footer() {
  const { settings, profile } = useSiteSettings();
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [subscribeEmailInput, setSubscribeEmailInput] = useState('');
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [subscribedData, setSubscribedData] = useState<{ name?: string; couponCode?: string } | null>(null);

  // Login prompt popup states
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingSubscribeAfterLogin, setPendingSubscribeAfterLogin] = useState(false);

  // Dynamic Categories from Admin
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = (force = false) => {
      getCategories(force)
        .then((cats) => {
          if (isMounted && Array.isArray(cats)) {
            setCategories(cats.filter((c) => c.id !== 'all' && c.status !== 'inactive'));
          }
        })
        .catch(() => {
          if (isMounted) setCategories([]);
        })
        .finally(() => {
          if (isMounted) setLoadingCategories(false);
        });
    };

    fetchCats();

    const handleCategoryUpdate = () => {
      fetchCats(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('category_updated', handleCategoryUpdate);
    }
    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('category_updated', handleCategoryUpdate);
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const checkSubscribed = async () => {
      try {
        const justSubscribed = typeof window !== 'undefined' && sessionStorage.getItem('labdhi_just_subscribed') === 'true';
        const saved = typeof window !== 'undefined' ? localStorage.getItem('labdhi_subscribed') : null;
        const parsed = saved ? JSON.parse(saved) : null;

        // If the user just completed subscription in this browser session, show the banner immediately!
        if (justSubscribed && parsed?.subscribed) {
          if (!isCancelled) {
            setIsAlreadySubscribed(true);
            setSubscribedData(parsed);
          }
          return;
        }

        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const loggedInUser = userRaw ? JSON.parse(userRaw) : null;
        const loggedInEmail = loggedInUser?.email?.toLowerCase().trim();

        if (loggedInUser && loggedInEmail) {
          // If local user data is already marked subscribed, show initial banner quickly
          if (loggedInUser.isSubscribed) {
            if (!isCancelled) {
              setIsAlreadySubscribed(true);
              setSubscribedData(
                parsed?.email?.toLowerCase() === loggedInEmail
                  ? parsed
                  : { name: loggedInUser.name, couponCode: 'WELCOME10' }
              );
            }
          }

          // Verify with backend database
          const statusRes = await checkSubscriberStatus(loggedInEmail);
          if (isCancelled) return;

          if (statusRes.success && statusRes.subscribed) {
            setIsAlreadySubscribed(true);
            setSubscribedData(statusRes.data || { name: loggedInUser.name, couponCode: 'WELCOME10' });

            if (!loggedInUser.isSubscribed) {
              loggedInUser.isSubscribed = true;
              localStorage.setItem('user', JSON.stringify(loggedInUser));
            }
            localStorage.setItem(
              'labdhi_subscribed',
              JSON.stringify({
                subscribed: true,
                ...(statusRes.data || {}),
              })
            );
          } else {
            // Not subscribed in database
            setIsAlreadySubscribed(false);
            setSubscribedData(null);
            if (loggedInUser.isSubscribed) {
              loggedInUser.isSubscribed = false;
              localStorage.setItem('user', JSON.stringify(loggedInUser));
            }
          }
        } else {
          // Guest visitor: Not subscribed
          setIsAlreadySubscribed(false);
          setSubscribedData(null);
        }
      } catch (e) {
        // ignore
      }
    };

    const handleAuthChange = () => {
      checkSubscribed();
      try {
        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (userRaw && token && pendingSubscribeAfterLogin) {
          setPendingSubscribeAfterLogin(false);
          setIsAuthModalOpen(false);
          setTimeout(() => {
            setIsSubscribeModalOpen(true);
          }, 350);
        }
      } catch (e) {}
    };

    checkSubscribed();
    window.addEventListener('labdhi_newsletter_subscribed', checkSubscribed);
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      isCancelled = true;
      window.removeEventListener('labdhi_newsletter_subscribed', checkSubscribed);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pendingSubscribeAfterLogin]);


  const fullAddress = settings.address || profile.address || '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009';
  const phone = settings.supportPhone || profile.adminPhone || '+91 93283 49328';
  const cleanPhone = phone.replace(/[^+\d]/g, '');
  const email = settings.supportEmail || profile.adminEmail || 'support@labdhiherbs.com';
  const city = settings.city || profile.city || 'Surat';
  const state = settings.state || profile.state || 'Gujarat';
  const country = profile.country || 'India';

  const whatsappRaw = settings.whatsappNumber || settings.supportPhone || profile.adminPhone || '+91 93283 49328';
  const cleanWhatsApp = whatsappRaw.replace(/[^+\d]/g, '').replace(/^\+/, '');

  const facebookUrl = settings.social?.facebook || profile.facebook || 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage';
  const instagramUrl = settings.social?.instagram || profile.instagram || 'https://www.instagram.com/labdhiherbs/';
  const youtubeUrl = settings.social?.youtube || profile.youtube;
  const twitterUrl = settings.social?.twitter || profile.twitter;

  // Dynamic logo check
  const darkLogo = settings.logoDark || settings.logoLight;

  const footerDescription = profile.footerDescription || settings.footerDescription || `Pure Ayurvedic medicines, face packs, hair oils, skincare lotions, and authentic herbal wellness handcrafted in ${city}, ${state}.`;

  return (
    <footer className="bg-[#F8F6F0] text-[#1A201C] border-t border-[#EFE9DD] pt-12 sm:pt-16 pb-8 sm:pb-12 relative overflow-hidden">
      
      {/* Background Soft Glow Accent */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        
        {/* Newsletter Banner - Clean Light Luxury Card */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE9DD] flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 shadow-sm">
          {isAlreadySubscribed ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] border border-[#C5DFD3] flex items-center justify-center shrink-0 text-[#1F3A2E] shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14261E]">
                    {subscribedData?.name ? `Namaste ${subscribedData.name} ji! ` : ''}You&apos;re subscribed to Labdhi Herbs 🌿
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thank you for being part of our Ayurvedic wellness family. Your exclusive welcome benefits are active.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-[#F8F6F0] px-3.5 py-2 rounded-xl border border-[#EFE9DD]">
                  <span className="text-[11px] text-slate-500 font-medium">Coupon:</span>
                  <span className="font-mono font-bold text-xs text-[#14261E] tracking-wider bg-white px-2.5 py-1 rounded-lg border border-[#EFE9DD]">
                    {subscribedData?.couponCode || 'WELCOME10'}
                  </span>
                </div>
                <Link
                  href="/products"
                  className="px-4 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Shop Herbs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-center lg:text-left w-full lg:w-auto">
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#1A201C] leading-snug">
                  Subscribe for Special Herbal Offers &amp; Wellness Tips
                </h3>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
                  const isLoggedIn = !!(userRaw && token);

                  if (!isLoggedIn) {
                    setIsLoginPromptOpen(true);
                  } else {
                    setIsSubscribeModalOpen(true);
                  }
                }}
                className="flex flex-col sm:flex-row w-full lg:w-auto max-w-md gap-2.5 sm:gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={subscribeEmailInput}
                  onChange={(e) => setSubscribeEmailInput(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-[#1A201C] placeholder-slate-400 text-xs focus:outline-none focus:border-[#1F3A2E] focus:ring-1 focus:ring-[#1F3A2E] flex-1 min-w-[200px]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm hover:shadow-md active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            </>
          )}
        </div>

        {/* Modal Dialog for Lead Capture (for logged in members) */}
        <NewsletterSubscribeModal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          initialEmail={subscribeEmailInput}
          source="footer_newsletter"
        />

        {/* Login Required Popup Modal for Unauthenticated Users */}
        <AnimatePresence>
          {isLoginPromptOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLoginPromptOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative w-full max-w-md bg-[#F8F6F0] rounded-3xl shadow-2xl border border-[#EFE9DD] overflow-hidden z-10 my-8 text-left"
              >
                {/* Header Banner */}
                <div className="bg-[#14261E] text-white px-6 sm:px-7 pt-6 pb-5 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#D4A373]/20 rounded-full blur-2xl pointer-events-none" />

                  <button
                    onClick={() => setIsLoginPromptOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider mb-2">
                    <Lock className="w-3 h-3 text-[#D4A373]" />
                    <span>Member Exclusive Benefit</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                    Login Required to Subscribe 🌿
                  </h3>
                  <p className="text-xs text-emerald-100/75 mt-1 font-light leading-relaxed">
                    Please log in or create an account to activate your subscription and unlock your 10% welcome discount.
                  </p>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-7 space-y-5">
                  <div className="space-y-2.5 text-xs text-slate-700 bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        🎁
                      </div>
                      <span className="font-medium">Instant 10% OFF discount coupon voucher</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        💬
                      </div>
                      <span className="font-medium">Herbal wellness advice &amp; offers on WhatsApp &amp; Email</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                        🌿
                      </div>
                      <span className="font-medium">Discount code linked safely to your personal account</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                    Already registered or joining us for the first time? Click below to log in or create your free account in 30 seconds.
                  </p>

                  {/* Actions */}
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLoginPromptOpen(false);
                        setPendingSubscribeAfterLogin(true);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                    >
                      <LogIn className="w-4 h-4 text-[#D4A373]" />
                      <span>Login / Create Account Now</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A373]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLoginPromptOpen(false)}
                      className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer text-center"
                    >
                      Maybe Later
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Authentication Modal (Forwarded from Login Prompt) */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingSubscribeAfterLogin(false);
          }}
        />

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pt-2">
          
          {/* Column 1: Contact Info (Full width on mobile) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              {darkLogo ? (
                <img
                  src={darkLogo.startsWith('http') ? darkLogo : `http://localhost:5000${darkLogo}`}
                  alt="Labdhi Herbs"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              ) : (
                <OriginalTransparentLogo className="h-10 sm:h-12 w-auto" isDarkBackground={false} />
              )}
            </Link>

            <p className="text-xs text-slate-600 font-light leading-relaxed max-w-sm">
              {footerDescription}
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 font-light pt-1">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B58A5A] shrink-0 mt-0.5" />
                <span className="leading-snug">{fullAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B58A5A] shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:underline text-[#1F3A2E] font-medium">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B58A5A] shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline text-[#1F3A2E] font-medium truncate max-w-[240px] sm:max-w-none">{email}</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Dynamic Categories */}
          <div className="col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F3A2E] tracking-wide border-b border-[#EFE9DD] pb-2 min-h-[28px] sm:min-h-[32px] flex items-end">
              Herbal Care
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              {categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      href={`/shop/${cat.id || cat.slug}`}
                      className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 leading-snug group"
                    >
                      <Leaf className="w-3 h-3 text-[#B58A5A] shrink-0 group-hover:rotate-12 transition-transform" />
                      <span className="truncate">{cat.name}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/shop" className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 leading-snug">
                      <Leaf className="w-3 h-3 text-[#B58A5A] shrink-0" /> Herbal Formulations
                    </Link>
                  </li>
                </>
              )}
              <li className="pt-1">
                <Link
                  href="/shop"
                  className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 font-bold text-[#B58A5A] leading-snug group"
                >
                  <ArrowRight className="w-3 h-3 shrink-0 group-hover:translate-x-1 transition-transform" /> All Formulations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links & Policies */}
          <div className="col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F3A2E] tracking-wide border-b border-[#EFE9DD] pb-2 min-h-[28px] sm:min-h-[32px] flex items-end">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link href="/about" className="hover:text-[#1F3A2E] transition-colors block leading-snug">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Help &amp; FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Track Order</Link></li>
              <li><Link href="/terms" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Refund Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Shipping Policy</Link></li>
              <li><a href={`tel:${cleanPhone}`} className="hover:text-[#1F3A2E] transition-colors block leading-snug">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 4: Follow Us & Direct Assistance */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 space-y-3.5 pt-2 sm:pt-0">
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F3A2E] tracking-wide border-b border-[#EFE9DD] pb-2 min-h-[28px] sm:min-h-[32px] flex items-end">
              Follow Our Journey
            </h4>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Connect with us for daily botanical wellness insights, customer transformations, and herbal remedies.
            </p>

            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
                  aria-label="Facebook Page"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
                  aria-label="YouTube Channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Direct WhatsApp Consultation Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                <span>WhatsApp Help: {whatsappRaw}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#EFE9DD] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>{settings.copyrightText || `Copyright ${new Date().getFullYear()} © Labdhi Herbs. All rights reserved.`}</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>100% Ayurvedic</span>
            <span>•</span>
            <span>{city}, {state}, {country}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
