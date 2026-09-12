'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';
import { CartItem } from '../types';
import { 
  FileText, 
  Shield, 
  RotateCcw, 
  Truck, 
  HelpCircle, 
  Info,
  ChevronRight,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface PolicyPageLayoutProps {
  title: string;
  badge: string;
  subtitle: string;
  contentHtml: string;
}

const POLICY_LINKS = [
  { href: '/terms', label: 'Terms & Conditions', icon: FileText },
  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
  { href: '/refund', label: 'Refund & Cancellation', icon: RotateCcw },
  { href: '/shipping', label: 'Shipping & Delivery', icon: Truck },
  { href: '/faq', label: 'Frequently Asked Questions', icon: HelpCircle },
  { href: '/about', label: 'About Us', icon: Info },
];

export default function PolicyPageLayout({
  title,
  badge,
  subtitle,
  contentHtml,
}: PolicyPageLayoutProps) {
  const pathname = usePathname();
  const { settings, profile } = useSiteSettings();
  const phone = profile.adminPhone || settings.supportPhone || '+91 93283 49328';
  const email = profile.adminEmail || settings.supportEmail || 'support@labdhiherbs.com';
  const city = profile.city || settings.city || 'Surat';

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] font-sans selection:bg-[#1F3A2E] selection:text-[#EFE9DD]">
      {/* Header */}
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-14 md:pt-40 md:pb-20 bg-[#14261E] text-white overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-3.5">
          {/* Breadcrumb */}
          <nav className="inline-flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
            <span className="text-[#D4A373] font-semibold">{title}</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E] border border-[#71846C]/40 text-[#D4A373] text-[11px] font-semibold uppercase tracking-wider mx-auto">
            <Sparkles className="w-3 h-3" />
            <span>{badge}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/75 font-light max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Sidebar: Quick Policy Navigation */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl border border-[#EFE9DD] p-5 shadow-xs space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#1A201C] tracking-wide pb-2 border-b border-[#EFE9DD]">
                Policy Directory
              </h3>

              <nav className="space-y-1.5">
                {POLICY_LINKS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#1F3A2E] text-[#D4A373] shadow-xs'
                          : 'text-slate-600 hover:bg-[#F8F6F0] hover:text-[#1F3A2E]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4A373]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Need Help Card */}
            <div className="p-5 rounded-2xl bg-[#1F3A2E] text-white border border-[#71846C]/30 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-[#D4A373] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Need Clarification?</span>
              </div>
              <p className="text-xs text-emerald-100/80 leading-relaxed font-light">
                Have questions regarding our policies or formulations? Our {city} team is happy to assist.
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <a
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-[#D4A373] hover:underline font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phone}</span>
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-[#D4A373] hover:underline font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{email}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Content: Dynamic Policy HTML rendered from Admin Settings */}
          <article className="lg:col-span-8 bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-10 md:p-12 shadow-xs space-y-6">
            <div
              className="policy-content prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </article>

        </div>
      </main>

      <style jsx global>{`
        .policy-content h1 {
          font-family: Georgia, Cambria, 'Times New Roman', Times, serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1F3A2E;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .policy-content h2 {
          font-family: Georgia, Cambria, 'Times New Roman', Times, serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #1F3A2E;
          margin-top: 1.5rem;
          margin-bottom: 0.6rem;
          padding-bottom: 0.3rem;
          border-bottom: 1px solid #EFE9DD;
        }
        .policy-content h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #2d5441;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .policy-content h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1A201C;
          margin-top: 1rem;
          margin-bottom: 0.4rem;
        }
        .policy-content p {
          margin-top: 0.6rem;
          margin-bottom: 0.6rem;
          line-height: 1.75;
          color: #475569;
        }
        .policy-content ul,
        .policy-content ol {
          padding-left: 1.5rem;
          margin-top: 0.6rem;
          margin-bottom: 0.6rem;
        }
        .policy-content li {
          margin-top: 0.3rem;
          margin-bottom: 0.3rem;
          color: #475569;
        }
        .policy-content a {
          color: #1F3A2E;
          text-decoration: underline;
          font-weight: 500;
        }
        .policy-content blockquote {
          border-left: 4px solid #D4A373;
          padding: 0.5rem 1rem;
          background: #F8F6F0;
          border-radius: 0 8px 8px 0;
          color: #64748B;
          font-style: italic;
          margin: 1rem 0;
        }
      `}</style>

      {/* Drawers and Modals */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          window.location.href = `/product/${p.id}`;
        }}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
