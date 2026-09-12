'use me';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SmoothScroll from '../../components/SmoothScroll';
import Header from '../../components/Header';
import FeaturedStoryVideo from '../../components/FeaturedStoryVideo';
import AsymmetricGallery from '../../components/AsymmetricGallery';
import QuickViewModal from '../../components/QuickViewModal';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import Footer from '../../components/Footer';
import { Product, CartItem, SuccessStory } from '../../types';
import { getSuccessStories } from '../../services/api';
import {
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Video,
  Leaf,
} from 'lucide-react';

export default function StoriesClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoStoryId, setSelectedVideoStoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const res = await getSuccessStories();
        if (res.success && res.data && res.data.length > 0) {
          setStories(res.data);
        }
      } catch (err) {
        console.error('Failed to load success stories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStories();
  }, []);

  // Dedicated Video Stories vs Photo Transformations
  const videoStories = stories.filter(
    (s) =>
      s.status === 'active' &&
      (s.storyType === 'video' || Boolean(s.videoUrl && s.videoUrl.trim().length > 0))
  );

  const photoStories = stories.filter(
    (s) =>
      s.status === 'active' &&
      (s.storyType === 'photo' ||
        (!s.videoUrl && Boolean(s.beforeImage && s.afterImage)))
  );

  const activeVideoStory =
    videoStories.find((s) => s.id === selectedVideoStoryId) ||
    videoStories.find((s) => s.featured) ||
    videoStories[0] ||
    null;

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

        {/* Hero Section with Safe Padding for Fixed Header */}
        <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-24 w-full flex items-center justify-center overflow-hidden bg-[#14261E]">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1800"
            alt="Labdhi Herbs Success Stories & Gallery Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#14261E] via-[#14261E]/75 to-black/40" />

          <div className="max-w-4xl mx-auto px-4 text-center space-y-4 relative z-10 flex flex-col items-center">
            
            {/* Breadcrumb Navigation - Dedicated Top Row */}
            <nav className="flex items-center gap-2 text-xs text-emerald-200/85 font-medium">
              <Link href="/" className="hover:text-[#D4A373] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="text-[#D4A373] font-semibold">Success Stories</span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Customer Stories & Transformations
            </h1>

            <p className="text-xs sm:text-base text-emerald-100/85 font-light max-w-2xl mx-auto leading-relaxed">
              Discover authentic video journeys, customer before & after results, and verified experiences of pure Gujarati Ayurveda.
            </p>

          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 relative">
          
          {/* SECTION 1: Featured Cinematic Video Story */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EFE9DD] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                  <Video className="w-3.5 h-3.5 text-[#B58A5A]" />
                  <span>Featured Video Journey</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                  Watch Real Customer Transformations
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-light max-w-xs">
                Hover over the video to preview or click to open full cinematic playback with audio.
              </p>
            </div>

            <FeaturedStoryVideo story={activeVideoStory} />
            
            {/* Multi-Video Selector (Shown if more than 1 video story exists) */}
            {videoStories.length > 1 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  More Video Transformations:
                </p>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {videoStories.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVideoStoryId(v.id)}
                      className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        activeVideoStory?.id === v.id
                          ? 'bg-[#1F3A2E] text-[#EFE9DD] border-[#1F3A2E] shadow-sm'
                          : 'bg-white text-slate-700 border-[#EFE9DD] hover:bg-[#F8F6F0]'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>{v.customer}</span>
                      <span className="text-[10px] opacity-75 font-light">({v.formulation})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* SECTION 2: Interactive Before & After Transformation Slider */}
          <section className="space-y-4 pt-4">
            <AsymmetricGallery stories={photoStories.length > 0 ? photoStories : undefined} />
          </section>

          {/* SECTION 4: Brand Trust Pillars & CTA */}
          <section className="p-8 sm:p-12 rounded-3xl bg-[#14261E] text-[#EFE9DD] border border-[#71846C]/30 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Herbal Wisdom</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                Begin Your Own Natural Healing Journey
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/75 font-light leading-relaxed">
                Join thousands across Surat and India who have revitalized their hair, skin, and joint vitality with Labdhi Herbs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 relative z-10">
              <Link
                href="/shop"
                className="px-8 py-4 rounded-2xl bg-[#D4A373] hover:bg-[#b88c5d] text-[#1F3A2E] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Explore All Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </main>

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

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => setQuickViewProduct(p)}
        />

      </div>
    </SmoothScroll>
  );
}
