'use me';
'use client';

import { useState } from 'react';
import Link from 'next/link';
import SmoothScroll from '../../components/SmoothScroll';
import Header from '../../components/Header';
import BrandStorySection from '../../components/BrandStorySection';
import BrandValuesGrid from '../../components/BrandValuesGrid';
import HerbalProcess from '../../components/HerbalProcess';
import QuickViewModal from '../../components/QuickViewModal';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import Footer from '../../components/Footer';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import {
  ChevronRight,
  Leaf,
  ShieldCheck,
  Heart,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Truck,
} from 'lucide-react';

export default function AboutClient() {
  const { cartCount, openCart, addToCart: handleAddToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans">
        
        {/* Header Navigation */}
        <Header
          cartCount={cartCount}
          onOpenCart={openCart}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* 60vh About Hero */}
        <section className="relative h-[60vh] min-h-[440px] max-h-[580px] w-full flex items-center justify-center overflow-hidden bg-[#14261E]">
          <img
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1800"
            alt="About Labdhi Herbs Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#14261E] via-[#14261E]/60 to-transparent" />

          <div className="max-w-4xl mx-auto px-4 text-center space-y-4 relative z-10 pt-16 flex flex-col items-center">
            
            {/* Breadcrumb Navigation - Dedicated Top Row */}
            <nav className="flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="text-[#D4A373] font-semibold">About Us</span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Pure Herbal Wisdom Handcrafted in Surat
            </h1>

            <p className="text-xs sm:text-base text-emerald-100/80 font-light max-w-2xl mx-auto leading-relaxed">
              Discover our journey of restoring authentic Ayurvedic self-care with 100% chemical-free hair, skin, and joint care formulations.
            </p>

          </div>
        </section>

        {/* Main Content Layout */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          
          {/* Section 01: Brand Story & Surat Roots */}
          <section className="space-y-3">
            <BrandStorySection />
          </section>

          {/* Section 02: Our Philosophy Statement Block */}
          {/* Section 02: Founding Mission & Transparency Promise (From Original Platform) */}
          <section className="p-8 sm:p-14 rounded-3xl bg-[#14261E] text-[#EFE9DD] border border-[#71846C]/30 shadow-2xl relative overflow-hidden space-y-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Founding Mission</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-snug">
                Transparent, Commission-Free &amp; Reliable Ayurvedic Care
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-light leading-relaxed">
                As set forth since our inception on the original Labdhi Herbs platform, our foundational purpose has remained unwavering:
              </p>
            </div>

            {/* Old Website Core Quote */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative z-10 space-y-3">
              <blockquote className="font-serif italic text-sm sm:text-base text-emerald-100 font-light leading-relaxed border-l-2 border-[#D4A373] pl-4">
                "To provide transparent, commission-free, fast, reliable and comprehensive information with a wide range of quality and value-for-money products and services, all under one roof — using resources and traditional wisdom that excite local artisan enterprise to thrive and develop a strong local herbal economy."
              </blockquote>
              <p className="text-[11px] text-[#D4A373] font-semibold pl-4">
                — Core Founding Charter, Labdhi Herbs Surat
              </p>
            </div>

            {/* 3 Pillars from Old Website */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-2">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 text-[#D4A373] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-white">Direct-to-Customer</h3>
                <p className="text-xs text-emerald-100/70 font-light leading-relaxed">
                  We don't act as commission-charging middlemen. By connecting our Surat workshop directly to you, we eliminate inflated retail margins so you receive genuine quality at honest prices.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 text-[#D4A373] flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-white">All Under One Roof</h3>
                <p className="text-xs text-emerald-100/70 font-light leading-relaxed">
                  A comprehensive herbal portfolio: from our celebrated Roopotkarsh Vilepan and face packs to pure hair oils, skincare ointments, and targeted muscle care remedies.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 text-[#D4A373] flex items-center justify-center">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-white">Direct Communication</h3>
                <p className="text-xs text-emerald-100/70 font-light leading-relaxed">
                  We understand the importance of direct dialogue between herbalist and user. We bridge all communication gaps with fast WhatsApp and phone assistance for real usage guidance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 03: Heritage Product Lines Under One Roof */}
          <section className="space-y-6 pt-6 border-t border-[#EFE9DD]">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[11px] font-bold text-[#71846C] uppercase tracking-wider">
                Comprehensive Ayurvedic Care
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                Our Signature Formulation Heritage
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-light">
                Developed over years of dedicated research in Gujarat, serving thousands of satisfied households.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] space-y-3 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center font-bold text-sm">
                  01
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">Skin &amp; Face Care</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Includes the revered <strong>Roopotkarsh Vilepan</strong> and <strong>Beautiction Face Pack</strong>, designed to naturally detoxify, clarify, and revitalize facial complexion.
                </p>
                <div className="pt-2 text-[11px] font-bold text-[#1F3A2E]">
                  100% Herbal Face Packs &amp; Pastes
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] space-y-3 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center font-bold text-sm">
                  02
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">Ayurvedic Hair Care</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Infused with Bhringraj, Amla, and Brahmi, our <strong>Ayurvedic Hair Growth Oil</strong> works from follicular roots to combat hair fall, premature graying, and dry scalp.
                </p>
                <div className="pt-2 text-[11px] font-bold text-[#1F3A2E]">
                  Cold-Pressed Botanical Oils
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] space-y-3 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center font-bold text-sm">
                  03
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">Muscle &amp; Joint Care</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Therapeutic formulation crafted with Mahanarayan and wintergreen extracts for natural pain alleviation, joint stiffness relief, and mobility restoration.
                </p>
                <div className="pt-2 text-[11px] font-bold text-[#1F3A2E]">
                  Deep Tissue Pain Relieving Herbs
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] space-y-3 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center font-bold text-sm">
                  04
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">Targeted Ointments</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Our iconic <strong>Soft-N-Silky Skincare Ointment</strong> provides deep dermis healing for cracked heels, irritated skin, and stubborn dryness.
                </p>
                <div className="pt-2 text-[11px] font-bold text-[#1F3A2E]">
                  Ayurvedic Soothing Balms
                </div>
              </div>
            </div>
          </section>

          {/* Section 04: Philosophy Statement Block */}
          <section className="p-8 sm:p-14 rounded-3xl bg-white border border-[#EFE9DD] text-center space-y-6 shadow-xs max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
              <span>Our Philosophy</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A201C] leading-snug">
              "Nature is at the heart of everything we create."
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              We believe true health and beauty do not require synthetic chemicals, parabens, or artificial fragrance. By honoring ancient Ayurvedic recipes and harvesting botanical ingredients at peak potency, we create formulations that work in harmony with your body.
            </p>
          </section>

          {/* Section 05: Brand Values Grid */}
          <section className="space-y-3 pt-6 border-t border-[#EFE9DD]">
            <BrandValuesGrid />
          </section>

          {/* Section 06: Herbal Process Showcase */}
          <section className="space-y-3 pt-6 border-t border-[#EFE9DD]">
            <HerbalProcess />
          </section>

          {/* Section 07: Surat Workshop & Direct Contact Verification */}
          <section className="p-8 sm:p-12 rounded-3xl bg-[#F8F6F0] border border-[#EFE9DD] shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#71846C] uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#B58A5A]" />
                  <span>Surat Headquarters &amp; Workshop</span>
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                  Authentic Origins in Adajan, Surat
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                  Every product is packaged and dispatched directly from our established workshop in Surat, Gujarat. We welcome personal inquiries, wholesale requests, and usage consultations.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700">
                  <p className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#1F3A2E] shrink-0 mt-0.5" />
                    <span><strong>Address:</strong> 40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#1F3A2E] shrink-0" />
                    <span><strong>Direct Helpline:</strong> +91 93283 49328 (Call / WhatsApp)</span>
                  </p>
                  <p className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#1F3A2E] shrink-0" />
                    <span><strong>Official Email:</strong> support@labdhiherbs.com</span>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-[#EFE9DD] space-y-4 shadow-sm text-center">
                <span className="w-12 h-12 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-[#1F3A2E]" />
                </span>
                <h4 className="font-serif text-lg font-bold text-[#1A201C]">Direct Dispatch Guarantee</h4>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Freshly packaged batches prepared with pure ingredients. Dispatched within 24–48 hours across India with end-to-end live tracking.
                </p>
                <Link
                  href="/track-order"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#1F3A2E] text-white text-xs font-semibold hover:bg-[#15271F] transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track An Existing Order</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Section 08: Success Stories Bridge & Shop CTA */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#EFE9DD]">
            
            {/* Bridge 1: Success Stories */}
            <div className="p-8 rounded-3xl bg-white border border-[#EFE9DD] space-y-4 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#71846C] uppercase tracking-wider">Customer Transformations</span>
                <h3 className="font-serif text-xl font-bold text-[#1A201C]">Real Customer Journeys</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  Discover verified experiences and video testimonials of customers using our Surat herbal formulations.
                </p>
              </div>
              <Link
                href="/stories"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1F3A2E] hover:text-[#B58A5A] transition-colors pt-2"
              >
                <span>Explore Success Stories &amp; Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bridge 2: Shop Formulations */}
            <div className="p-8 rounded-3xl bg-[#14261E] text-white border border-[#71846C]/30 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider">Explore Collection</span>
                <h3 className="font-serif text-xl font-bold text-white">Experience Pure Ayurveda</h3>
                <p className="text-xs text-emerald-100/70 font-light leading-relaxed">
                  Browse our complete range of handcrafted hair oils, face packs, ointments, and joint care remedies.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#D4A373] hover:text-white transition-colors pt-2"
              >
                <span>Shop All Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </section>

        </main>

        {/* Footer */}
        <Footer />

        {/* Modals & Drawers */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => setQuickViewProduct(p)}
        />

      </div>
    </SmoothScroll>
  );
}
