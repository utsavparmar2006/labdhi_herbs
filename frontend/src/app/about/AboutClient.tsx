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
import { Product, CartItem } from '../../types';
import { ChevronRight, Leaf, ShieldCheck, Heart, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans">
        
        {/* Header Navigation */}
        <Header
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
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

          {/* Section 03: Brand Values Grid */}
          <section className="space-y-3 pt-6 border-t border-[#EFE9DD]">
            <BrandValuesGrid />
          </section>

          {/* Section 04: Herbal Process Showcase */}
          <section className="space-y-3 pt-6 border-t border-[#EFE9DD]">
            <HerbalProcess />
          </section>

          {/* Section 05: Success Stories Bridge & Shop CTA */}
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
                <span>Explore Success Stories & Gallery</span>
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

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
        />

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
