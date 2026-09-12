'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import { CartItem } from '../../types';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Sparkles, 
  Phone, 
  Mail,
  Search
} from 'lucide-react';

export default function FaqPage() {
  const { settings, profile } = useSiteSettings();
  const phone = profile.adminPhone || settings.supportPhone || '+91 93283 49328';
  const email = profile.adminEmail || settings.supportEmail || 'support@labdhiherbs.com';
  const city = profile.city || settings.city || 'Surat';

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Filter only active FAQs and sort by order
  const activeFaqs = (settings.faq || [])
    .filter((f) => f.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const filteredFaqs = searchQuery.trim()
    ? activeFaqs.filter(
        (f) =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeFaqs;

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] font-sans selection:bg-[#1F3A2E] selection:text-[#EFE9DD]">
      <Header
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Hero Banner */}
      <section className="relative pt-32 pb-14 md:pt-40 md:pb-20 bg-[#14261E] text-white overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <nav className="inline-flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
            <span className="text-[#D4A373] font-semibold">Help &amp; FAQ</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E] border border-[#71846C]/40 text-[#D4A373] text-[11px] font-semibold uppercase tracking-wider mx-auto">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Frequently Asked Questions
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/75 font-light max-w-xl mx-auto leading-relaxed">
            Find quick answers about our pure botanical formulations, dispatch from Surat, orders, and delivery.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-emerald-100/50 text-xs focus:outline-none focus:border-[#D4A373] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main FAQ Accordion Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#EFE9DD] space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">No matching questions found</p>
            <p className="text-xs text-slate-400">Try searching for different keywords or reach out to our team.</p>
          </div>
        ) : (
          filteredFaqs.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item._id || idx}
                className="bg-white rounded-2xl border border-[#EFE9DD] overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <span className="font-serif text-sm sm:text-base font-bold text-[#1A201C]">
                    {item.question}
                  </span>
                  <div className={`p-1.5 rounded-full ${isOpen ? 'bg-[#1F3A2E] text-white' : 'bg-[#F8F6F0] text-slate-500'}`}>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-[#F8F6F0]">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Contact Support Block */}
        <div className="mt-12 p-8 rounded-3xl bg-[#1F3A2E] text-white border border-[#71846C]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-white">Still have questions?</h3>
            <p className="text-xs text-emerald-100/70 font-light">
              Our Ayurvedic wellness consultants in {city} are available to guide you.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A373] text-[#1F3A2E] text-xs font-bold uppercase tracking-wider hover:bg-[#c69260] transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Us</span>
            </a>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </main>

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

      <Footer />
    </div>
  );
}
