'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SmoothScroll from '../../../components/SmoothScroll';
import Header from '../../../components/Header';
import ProductGallery from '../../../components/ProductGallery';
import ProductTabs from '../../../components/ProductTabs';
import ProductReviewsSection from '../../../components/ProductReviewsSection';
import RelatedProducts from '../../../components/RelatedProducts';
import QuickViewModal from '../../../components/QuickViewModal';
import CartDrawer from '../../../components/CartDrawer';
import AuthModal from '../../../components/AuthModal';
import SearchModal from '../../../components/SearchModal';
import Footer from '../../../components/Footer';
import { getProductById } from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { Product, CartItem } from '../../../types';
import { 
  ChevronRight, 
  Star, 
  ShoppingBag, 
  Zap, 
  Check, 
  ShieldCheck, 
  Truck, 
  Leaf, 
  ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductClientProps {
  productId: string;
}

export default function ProductClient({ productId }: ProductClientProps) {
  const router = useRouter();
  const {
    items: cart,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity: handleUpdateCartQuantity,
    removeFromCart: handleRemoveCartItem,
  } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLatestProduct() {
      try {
        const res = await getProductById(productId);
        if (res.success && res.data && isMounted) {
          setProduct(res.data);
        } else if (isMounted) {
          setProduct(null);
        }
      } catch (err) {
        if (isMounted) setProduct(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLatestProduct();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const [quantity, setQuantity] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const handleRatingUpdate = useCallback((newRating: number, newCount: number) => {
    setProduct((prev) => {
      if (!prev) return null;
      if (prev.rating === newRating && prev.reviewsCount === newCount) return prev;
      return {
        ...prev,
        rating: newRating,
        reviewsCount: newCount,
      };
    });
  }, []);

  if (loading) {
    return (
      <SmoothScroll>
        <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 font-light">Loading formulation details...</p>
          </div>
        </div>
      </SmoothScroll>
    );
  }

  if (!product) {
    return (
      <SmoothScroll>
        <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] flex flex-col justify-between">
          <Header
            cartCount={cartCount}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
          <div className="max-w-md mx-auto text-center py-28 px-4 space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#1A201C]">Formulation Not Found</h2>
            <p className="text-sm text-slate-500 font-light">
              This herbal formulation is not available or has been removed.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 rounded-full bg-[#1F3A2E] text-white text-xs font-semibold hover:bg-[#14261E] transition-colors"
            >
              Explore Formulations
            </Link>
          </div>
          <Footer />
        </div>
      </SmoothScroll>
    );
  }

  // Discount percentage calculation
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = (targetProduct = product, qty = quantity) => {
    if (!targetProduct) return;
    addToCart(targetProduct, qty);
    setIsAddedSuccess(true);
    setTimeout(() => setIsAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans pb-20 md:pb-0">
        
        {/* Header Navigation */}
        <Header
          cartCount={cartCount}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-40 pb-12 space-y-10">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-[#1F3A2E] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href="/shop" className="hover:text-[#1F3A2E] transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-[#1F3A2E] transition-colors">
              {product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[#1F3A2E] font-semibold truncate max-w-xs">{product.name}</span>
          </nav>

          {/* Main 2-Column Product Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Product Gallery (Sticky & Balanced) */}
            <div className="lg:col-span-5 lg:sticky lg:top-36">
              <ProductGallery
                images={Array.from(
                  new Set(
                    [
                      ...(product.images && product.images.length > 0 ? product.images : []),
                      product.image,
                      product.hoverImage,
                    ].filter((img): img is string => Boolean(img && img.trim()))
                  )
                )}
                productName={product.name}
                tag={product.tag}
                videoUrl={product.videoUrl}
              />
            </div>

            {/* Right Column: Product Info & Purchase Actions */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="space-y-2">
                {/* Category Label */}
                {product.category && (
                  <span className="text-xs font-bold text-[#B58A5A] uppercase tracking-wider block">
                    {product.category}
                  </span>
                )}

                {/* Product Title */}
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A201C] tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Review Counter (Click to scroll to reviews) */}
                <a
                  href="#reviews-section"
                  className="inline-flex items-center gap-3 text-xs group cursor-pointer"
                  title="View customer reviews and ratings"
                >
                  <div className="flex items-center gap-1 bg-amber-50 group-hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 text-amber-700 font-bold transition-colors">
                    <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-slate-500 font-light group-hover:text-[#14261E] group-hover:underline transition-colors">
                    Based on {product.reviewsCount} customer {product.reviewsCount === 1 ? 'review' : 'reviews'}
                  </span>
                </a>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] space-y-1 shadow-2xs">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#1F3A2E]">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-base text-slate-400 line-through">₹{product.originalPrice}</span>
                  )}
                  {discountPercent && (
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-700 font-medium">Inclusive of all taxes • Free shipping across India</p>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                {product.description}
              </p>

              {/* Quantity Counter */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A201C] uppercase tracking-wider">Quantity</label>
                <div className="inline-flex items-center rounded-xl bg-white border border-[#EFE9DD] p-1 shadow-2xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg hover:bg-[#F8F6F0] flex items-center justify-center font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-[#1A201C]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-lg hover:bg-[#F8F6F0] flex items-center justify-center font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleAddToCart(product, quantity)}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    isAddedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#1F3A2E] hover:bg-[#15271F] text-white'
                  }`}
                >
                  {isAddedSuccess ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-[#D4A373]" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full py-4 rounded-2xl bg-[#B58A5A] hover:bg-[#997349] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-5 h-5" />
                  <span>Buy Now — Instant Checkout</span>
                </button>
              </div>

              {/* Trust Badges Bar */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#EFE9DD]">
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-[#1F3A2E]" />
                  <span>100% Herbal Formulation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <Truck className="w-4 h-4 text-[#1F3A2E]" />
                  <span>Fast Dispatch from Surat</span>
                </div>
              </div>

            </div>

          </div>

          {/* Product Details Tabs (Description, Ingredients, Benefits, Usage) */}
          <ProductTabs
            description={product.description}
            category={product.category}
            howToUseVideoUrl={product.howToUseVideoUrl}
            usage={product.usage}
            benefits={product.benefits}
            ingredients={product.ingredients}
          />

          {/* Customer Reviews & Ratings Engine */}
          <ProductReviewsSection
            productId={product.id}
            productName={product.name}
            onRatingUpdate={handleRatingUpdate}
          />

          {/* Related Formulations Showcase */}
          <RelatedProducts
            currentProductId={product.id}
            category={product.category}
            onAddToCart={(p, q) => handleAddToCart(p, q)}
            onQuickView={(p) => setQuickViewProduct(p)}
          />

        </main>

        {/* Footer */}
        <Footer />

        {/* Mobile Sticky Bottom Purchase Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EFE9DD] p-3 px-4 flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-xs text-slate-400 block">Total Price</span>
            <span className="text-lg font-bold text-[#1F3A2E]">₹{product.price * quantity}</span>
          </div>

          <button
            onClick={() => handleAddToCart(product, quantity)}
            className="px-6 py-3 rounded-xl bg-[#1F3A2E] text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
            <span>Add to Cart</span>
          </button>
        </div>

        {/* Modals & Drawers */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(p, q) => handleAddToCart(p, q)}
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
