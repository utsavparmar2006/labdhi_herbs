'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OriginalTransparentLogo from './OriginalTransparentLogo';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Menu, 
  X, 
  ChevronDown, 
  Leaf, 
  Image as ImageIcon, 
  Video as VideoIcon,
  Phone,
  Mail,
  Sparkles,
  Package,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { getHomePageConfig } from '../services/api';
import { AnnouncementBarConfig } from '../types';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
}

const DEFAULT_ANNOUNCEMENTS = [
  '🌿 Pure Herbal Formulations • Free Shipping Across India',
  '🚚 Express Fast Dispatch Direct from Surat Workshop',
  '✨ Special Offer: 10% Extra Discount on First Order',
];

const NAV_ITEMS = [
  {
    name: 'Home',
    href: '/',
    isActive: (pathname: string) => pathname === '/',
  },
  {
    name: 'Shop',
    href: '/shop',
    isActive: (pathname: string) =>
      pathname === '/shop' ||
      pathname.startsWith('/shop/') ||
      pathname.startsWith('/product/') ||
      pathname.startsWith('/category/'),
  },
  {
    name: 'Success Story',
    href: '/gallery',
    isActive: (pathname: string) =>
      pathname === '/gallery' ||
      pathname.startsWith('/gallery/') ||
      pathname === '/stories' ||
      pathname.startsWith('/stories/') ||
      pathname === '/success-stories',
  },
  {
    name: 'Blog',
    href: '/blog',
    isActive: (pathname: string) =>
      pathname === '/blog' || pathname.startsWith('/blog/'),
  },
  {
    name: 'About Us',
    href: '/about',
    isActive: (pathname: string) =>
      pathname === '/about' || pathname.startsWith('/about/'),
  },
];

export default function Header({
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenSearch,
}: HeaderProps) {
  const { settings, profile } = useSiteSettings();
  const pathname = usePathname() || '';
  const cartContext = useCart();
  const effectiveCartCount = cartCount !== undefined ? cartCount : cartContext.cartCount;
  const effectiveOnOpenCart = onOpenCart || cartContext.openCart;

  const lightLogo = settings.logoLight;
  const darkLogo = settings.logoDark;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storyDropdownOpen, setStoryDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [user, setUser] = useState<{ _id?: string; name: string; email: string; role?: string } | null>(null);

  const [announcementBar, setAnnouncementBar] = useState<AnnouncementBarConfig>({
    enabled: true,
    phone: '+91 93283 49328',
    email: 'support@labdhiherbs.com',
    locationText: 'Surat, Gujarat',
    badgeText: '100% Authentic',
    messages: DEFAULT_ANNOUNCEMENTS,
  });

  const displayPhone = profile.adminPhone || announcementBar.phone || '+91 93283 49328';
  const cleanPhone = displayPhone.replace(/[^+\d]/g, '');
  const displayEmail = profile.adminEmail || announcementBar.email || 'support@labdhiherbs.com';
  const displayLocation = (profile.city && profile.state) 
    ? `${profile.city}, ${profile.state}` 
    : (announcementBar.locationText || 'Surat, Gujarat');

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') return;
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();

    if (typeof window !== 'undefined') {
      window.addEventListener('authChange', checkAuth);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('authChange', checkAuth);
      }
    };
  }, []);

  // Fetch dynamic announcement bar configuration from backend
  useEffect(() => {
    let isMounted = true;
    const loadConfig = async () => {
      try {
        const data = await getHomePageConfig();
        if (data?.announcementBar && isMounted) {
          setAnnouncementBar(data.announcementBar);
        }
      } catch (e) {
        // Fallback to defaults
      }
    };

    loadConfig();

    const handleConfigUpdate = (e: any) => {
      if (e.detail?.announcementBar && isMounted) {
        setAnnouncementBar(e.detail.announcementBar);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('homepageConfigUpdated', handleConfigUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('homepageConfigUpdated', handleConfigUpdate);
      }
    };
  }, []);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
    }
    setUser(null);
    setUserDropdownOpen(false);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      await fetch(`${apiBase}/v1/auth/logout`, { method: 'POST' });
    } catch (e) {
      // Ignore network logout errors
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeMessages =
    announcementBar.messages && announcementBar.messages.length > 0
      ? announcementBar.messages
      : DEFAULT_ANNOUNCEMENTS;

  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % activeMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeMessages.length]);

  return (
    <div data-header="true" className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      
      {/* Dynamic Sticky Top Announcement Bar (Hero Line) */}
      {announcementBar.enabled && (
        <div
          className={`w-full transition-all duration-300 flex items-center justify-between px-4 sm:px-8 border-b ${
            isScrolled
              ? 'bg-[#14261E]/95 backdrop-blur-md py-1.5 border-[#71846C]/30 text-white text-[11px]'
              : 'bg-[#1F3A2E] py-2 border-[#71846C]/40 text-[#EFE9DD] text-xs'
          }`}
        >
          {/* Left Info: Contact */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] text-[#D4A373]">
            {displayPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Phone className="w-3 h-3" />
                <span>{displayPhone}</span>
              </a>
            )}
            {displayEmail && (
              <a
                href={`mailto:${displayEmail}`}
                className="flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Mail className="w-3 h-3" />
                <span>{displayEmail}</span>
              </a>
            )}
          </div>

          {/* Center: Dynamic Animated Announcement Ticker */}
          <div className="mx-auto lg:mx-0 w-full lg:w-auto min-h-[22px] sm:h-5 flex items-center justify-center font-medium tracking-wide px-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={announcementIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-1.5 text-center text-[10px] sm:text-xs leading-tight"
              >
                <Sparkles className="w-3 h-3 text-[#D4A373] shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-none">
                  {activeMessages[announcementIndex % activeMessages.length]}
                </span>
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Right Info: Location & Authenticity Tag */}
          <div className="hidden md:flex items-center gap-3 text-[11px] text-[#D4A373]">
            <span>{displayLocation}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-300 font-semibold">
              {announcementBar.badgeText || '100% Authentic'}
            </span>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Navigation Bar */}
      <header
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F8F6F0]/95 backdrop-blur-xl shadow-md text-[#1A201C] py-2 sm:py-2.5 border-b border-[#EFE9DD]'
            : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white py-2.5 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          
          {/* Brand Logo - Original Client Logo with 100% Removed Background */}
          <Link href="/" className="flex items-center group shrink-0">
            {(isScrolled ? (darkLogo || lightLogo) : (lightLogo || darkLogo)) ? (
              <img
                src={(isScrolled ? (darkLogo || lightLogo) : (lightLogo || darkLogo))!.startsWith('http') 
                  ? (isScrolled ? (darkLogo || lightLogo) : (lightLogo || darkLogo))! 
                  : `http://localhost:5000${isScrolled ? (darkLogo || lightLogo) : (lightLogo || darkLogo)}`}
                alt="Labdhi Herbs Logo"
                className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <OriginalTransparentLogo
                className="h-8 sm:h-10 md:h-12 max-w-[130px] sm:max-w-[180px] md:max-w-none w-auto transition-transform group-hover:scale-105"
                isDarkBackground={!isScrolled}
              />
            )}
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative py-2 transition-all duration-200 group flex flex-col items-center ${
                    active
                      ? isScrolled
                        ? 'text-[#1F3A2E] font-bold'
                        : 'text-[#F4BA44] font-bold'
                      : isScrolled
                        ? 'text-[#1A201C]/75 hover:text-[#1F3A2E] font-medium'
                        : 'text-white/80 hover:text-white font-medium'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{item.name}</span>
                  </span>

                  {/* Active Indicator Mark */}
                  {active ? (
                    <motion.div
                      layoutId="activeDesktopNavMark"
                      className={`absolute -bottom-0.5 left-0 right-0 h-[2.5px] rounded-full ${
                        isScrolled ? 'bg-[#1F3A2E]' : 'bg-[#F4BA44]'
                      }`}
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  ) : (
                    <span
                      className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-[2px] rounded-full transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-70 ${
                        isScrolled ? 'bg-[#1F3A2E]' : 'bg-[#F4BA44]'
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons (Search, Account, Cart) */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              aria-label="Search"
              className={`p-2 rounded-full transition-all ${
                isScrolled
                  ? 'hover:bg-[#EFE9DD] text-[#1A201C]'
                  : 'hover:bg-white/10 text-white'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Profile / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                    isScrolled
                      ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white hover:bg-[#15271F]'
                      : 'border-white/40 bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Hi, {user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-[#D4A373]" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white text-[#1A201C] rounded-2xl shadow-xl border border-[#EFE9DD] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-[#EFE9DD] space-y-0.5">
                        <p className="text-xs font-bold text-[#1F3A2E] truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3A2E] hover:bg-[#F8F6F0] hover:text-[#D4A373] transition-colors flex items-center gap-2.5"
                        >
                          <User className="w-3.5 h-3.5 text-[#71846C]" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3A2E] hover:bg-[#F8F6F0] hover:text-[#D4A373] transition-colors flex items-center gap-2.5"
                        >
                          <Package className="w-3.5 h-3.5 text-[#71846C]" />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          href="/track-order"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold text-[#1F3A2E] hover:bg-[#F8F6F0] hover:text-[#D4A373] transition-colors flex items-center gap-2.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#71846C]" />
                          <span>Track Order</span>
                        </Link>

                        {user.role === 'admin' && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors flex items-center gap-2.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-[#EFE9DD] pt-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isScrolled
                    ? 'border-[#1F3A2E] text-[#1F3A2E] hover:bg-[#1F3A2E] hover:text-white'
                    : 'border-white/40 text-white hover:bg-white hover:text-[#1F3A2E]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            {/* Cart Trigger */}
            <button
              onClick={effectiveOnOpenCart}
              aria-label="Shopping Cart"
              className="relative p-2 rounded-full bg-[#1F3A2E] text-[#EFE9DD] hover:bg-[#15271F] transition-all shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-[#D4A373]" />
              {effectiveCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A373] text-[#1F3A2E] font-bold text-[10px] rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {effectiveCartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-[#1A201C]' : 'text-white'}`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Overlay & Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Dimmed Blurred Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Solid Drawer Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-full max-w-[320px] sm:max-w-xs bg-[#F8F6F0] text-[#1A201C] shadow-2xl z-50 flex flex-col justify-between overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div>
                <div className="p-4 flex items-center justify-between border-b border-[#EFE9DD] bg-white sticky top-0 z-10">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                    <OriginalTransparentLogo className="h-8 w-auto" isDarkBackground={false} />
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-[#1F3A2E]" />
                  </button>
                </div>

                {/* Main Navigation Links */}
                <div className="p-4 flex flex-col gap-1.5">
                  {NAV_ITEMS.map((item) => {
                    const active = item.isActive(pathname);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`py-3 px-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                          active
                            ? 'bg-[#1F3A2E] text-white shadow-xs font-bold'
                            : 'text-[#1F3A2E] hover:bg-[#EFE9DD]/60 hover:text-[#D4A373]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {active && (
                            <span className="w-2 h-2 rounded-full bg-[#F4BA44] animate-pulse" />
                          )}
                          <span>
                            {item.name === 'Shop'
                              ? 'Shop All Formulations'
                              : item.name === 'Success Story'
                              ? 'Success Stories & Gallery'
                              : item.name === 'Blog'
                              ? 'Herbal Wellness Blog'
                              : item.name === 'About Us'
                              ? 'About Labdhi Herbs'
                              : item.name}
                          </span>
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 ${active ? 'text-[#F4BA44]' : 'text-slate-400'}`}
                        />
                      </Link>
                    );
                  })}

                  <div className="pt-1.5 border-t border-[#EFE9DD]/70">
                    <Link
                      href="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`py-3 px-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                        pathname === '/track-order' || pathname.startsWith('/track-order/')
                          ? 'bg-[#1F3A2E] text-white shadow-xs font-bold'
                          : 'text-[#1F3A2E] hover:bg-[#EFE9DD]/60 hover:text-[#F4BA44]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        {(pathname === '/track-order' || pathname.startsWith('/track-order/')) && (
                          <span className="w-2 h-2 rounded-full bg-[#F4BA44] animate-pulse" />
                        )}
                        <Truck className={`w-4 h-4 ${(pathname === '/track-order' || pathname.startsWith('/track-order/')) ? 'text-[#F4BA44]' : 'text-[#B58A5A]'}`} />
                        <span>Track Order</span>
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 ${(pathname === '/track-order' || pathname.startsWith('/track-order/')) ? 'text-[#F4BA44]' : 'text-slate-400'}`}
                      />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Bottom Account & Support Area */}
              <div className="p-4 border-t border-[#EFE9DD] bg-[#F8F6F0] space-y-3">
                {user ? (
                  <div className="space-y-2.5">
                    {/* User Info Card */}
                    <div className="p-3 rounded-xl bg-white border border-[#EFE9DD] shadow-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1F3A2E] truncate">{user.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {/* My Profile & My Orders Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-[#EFE9DD] text-[#1F3A2E] text-xs font-bold border border-[#EFE9DD] transition-all shadow-xs"
                      >
                        <User className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white hover:bg-[#EFE9DD] text-[#1F3A2E] text-xs font-bold border border-[#EFE9DD] transition-all shadow-xs"
                      >
                        <Package className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>My Orders</span>
                      </Link>
                    </div>

                    {/* Admin Dashboard if Admin */}
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all shadow-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out Account</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth();
                    }}
                    className="w-full py-3 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <User className="w-4 h-4 text-[#D4A373]" />
                    <span>Sign In / Register Account</span>
                  </button>
                )}

                {/* Support Helpline Footer */}
                <div className="text-center pt-1 text-[11px] text-slate-500">
                  Need help? Call{' '}
                  <a href={`tel:${cleanPhone}`} className="font-bold text-[#1F3A2E] hover:underline">
                    {displayPhone}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
