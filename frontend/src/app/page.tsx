'use client';

import { useState } from 'react';
import SmoothScroll from '../components/SmoothScroll';
import Header from '../components/Header';
import VideoHero from '../components/VideoHero';
import TrustBadges from '../components/TrustBadges';
import CategoryGrid from '../components/CategoryGrid';
import FeaturedProducts from '../components/FeaturedProducts';
import AboutSection from '../components/AboutSection';
import PromoBannerCarousel from '../components/PromoBannerCarousel';
import WhyChooseUs from '../components/WhyChooseUs';
import BlogSection from '../components/BlogSection';
import QuickViewModal from '../components/QuickViewModal';
import CartDrawer from '../components/CartDrawer';
import AuthModal from '../components/AuthModal';
import SearchModal from '../components/SearchModal';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export default function Home() {
  const {
    items: cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateCartQuantity,
    removeFromCart: handleRemoveCartItem,
  } = useCart();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const handleSelectCategory = (categorySlug: string) => {
    setSelectedCategoryFilter(categorySlug);
    const productsEl = document.getElementById('products');
    if (productsEl) {
      productsEl.scrollIntoView({ behavior: 'smooth' });
    }
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

        {/* Hero Section with HTML5 Video */}
        <VideoHero />

        {/* Trust Badges Bar */}
        <TrustBadges />

        {/* Category Discovery */}
        <CategoryGrid onSelectCategory={handleSelectCategory} />

        {/* Featured Products Catalog */}
        <FeaturedProducts
          onAddToCart={(product) => handleAddToCart(product, 1)}
          onQuickView={(product) => setQuickViewProduct(product)}
          selectedCategoryFilter={selectedCategoryFilter}
        />

        {/* About Us & Brand Heritage */}
        <AboutSection />

        {/* Dynamic Promotional Banner Slider from Admin Settings */}
        <PromoBannerCarousel />

        {/* Why Choose Labdhi Herbs */}
        <WhyChooseUs />

        {/* Herbal Wellness Journal */}
        <BlogSection />

        {/* Footer */}
        <Footer />

        {/* Interactive Modals & Drawers */}
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
          onSelectProduct={(product) => setQuickViewProduct(product)}
        />

      </div>
    </SmoothScroll>
  );
}
