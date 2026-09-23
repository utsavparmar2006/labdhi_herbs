'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import SmoothScroll from '../../../../components/SmoothScroll';
import Header from '../../../../components/Header';
import CartDrawer from '../../../../components/CartDrawer';
import AuthModal from '../../../../components/AuthModal';
import SearchModal from '../../../../components/SearchModal';
import QuickViewModal from '../../../../components/QuickViewModal';
import Footer from '../../../../components/Footer';
import BrandDropdown from '../../../../components/BrandDropdown';
import SortDropdown from '../../../../components/SortDropdown';
import { PRODUCTS } from '../../../../services/mockData';
import { MainCategory, SubCategory, Product } from '../../../../types';
import { useCart } from '../../../../context/CartContext';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Check,
  Filter,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  mainCategory: MainCategory;
  subCategory: SubCategory;
}

export default function SubCategoryProductsClient({ mainCategory, subCategory }: Props) {
  const { cartCount, openCart, addToCart: contextAddToCart } = useCart();
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSort, setSelectedSort] = useState('featured');

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(8);

  // Filter products for this subcategory
  const filteredProducts = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const matchSub =
        p.subCategory?.toLowerCase() === subCategory.slug.toLowerCase() ||
        p.subCategory?.toLowerCase() === subCategory.name.toLowerCase() ||
        p.category.toLowerCase() === subCategory.name.toLowerCase();

      const matchMain =
        p.mainCategory?.toLowerCase() === mainCategory.slug.toLowerCase() ||
        p.category.toLowerCase() === mainCategory.slug.toLowerCase();

      return matchSub || (matchMain && !p.subCategory);
    });

    // Brand filter
    if (selectedBrand !== 'All') {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(selectedBrand.toLowerCase()) ||
          p.description.toLowerCase().includes(selectedBrand.toLowerCase())
      );
    }

    // Sort
    if (selectedSort === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (selectedSort === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (selectedSort === 'rating') list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [mainCategory, subCategory, selectedBrand, selectedSort]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const handleAddToCart = (product: Product, quantity = 1) => {
    contextAddToCart(product, quantity);
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => setAddedItemIds((prev) => prev.filter((id) => id !== product.id)), 1500);
  };

  const bannerImage =
    subCategory.image ||
    mainCategory.image ||
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans">

        <Header
          cartCount={cartCount}
          onOpenCart={openCart}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Sub-Category Hero Banner (Clean Ayurvedic Deep Green Matching Policy Pages) */}
        <section className="relative pt-32 pb-14 md:pt-40 md:pb-16 bg-[#14261E] text-white overflow-hidden">
          {/* Background glow accent */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-center gap-3.5">
            
            {/* Breadcrumb Navigation & Back button */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/shop/${mainCategory.id}`}
                className="inline-flex items-center gap-2 text-emerald-200 text-xs font-semibold hover:text-[#D4A373] transition-colors w-fit bg-white/10 px-3.5 py-1.5 rounded-full border border-white/15 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to {mainCategory.name}</span>
              </Link>

              <div className="flex items-center gap-1.5 text-xs text-emerald-200/80 font-medium">
                <Link href="/shop" className="hover:text-white transition-colors">
                  Shop
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
                <Link href={`/shop/${mainCategory.id}`} className="hover:text-white transition-colors">
                  {mainCategory.name}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
                <span className="text-[#D4A373] font-bold">{subCategory.name}</span>
              </div>
            </div>

            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {subCategory.name}
              </h1>
              {subCategory.description && (
                <p className="mt-2 text-xs sm:text-base text-emerald-100/75 font-light max-w-xl leading-relaxed">
                  {subCategory.description}
                </p>
              )}
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

          {/* Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Showing <strong className="text-[#1F3A2E]">{displayedProducts.length}</strong> of <strong className="text-[#1F3A2E]">{filteredProducts.length}</strong> Formulations
              </span>

              {selectedBrand !== 'All' && (
                <button
                  onClick={() => { setSelectedBrand('All'); setSelectedSort('featured'); }}
                  className="text-xs font-semibold text-[#1F3A2E] hover:underline flex items-center gap-1 cursor-pointer ml-2"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Filter
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <BrandDropdown selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />
              <SortDropdown selectedSort={selectedSort} onSelectSort={setSelectedSort} />
            </div>
          </div>

          {/* Product Grid */}
          {displayedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#EFE9DD] p-8 space-y-4 shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#1F3A2E]/10 flex items-center justify-center">
                <Filter className="w-8 h-8 text-[#1F3A2E]" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A201C]">No Formulations Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-light">
                We couldn't find any products in this subcategory matching your filters.
              </p>
              <Link
                href={`/shop/${mainCategory.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1F3A2E] text-white text-xs font-semibold shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                View Other Sub-Categories
              </Link>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
            >
              <AnimatePresence>
                {displayedProducts.map((product) => {
                  const isAdded = addedItemIds.includes(product.id);
                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      className="group rounded-2xl bg-white border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Image Container - Click to open product */}
                      <Link
                        href={`/product/${product.id}`}
                        className="block relative aspect-square bg-[#F8F6F0] overflow-hidden cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Tag Badge */}
                        {product.tag && (
                          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs pointer-events-none">
                            {product.tag}
                          </span>
                        )}
                      </Link>

                      {/* Card Content */}
                      <div className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                        <Link href={`/product/${product.id}`} className="space-y-1 sm:space-y-1.5 block cursor-pointer">
                          <div className="flex items-center justify-between text-[10px] sm:text-[11px]">
                            <span className="text-[#71846C] font-semibold uppercase tracking-wider truncate mr-1">
                              {product.category}
                            </span>
                            <div className="flex items-center gap-0.5 sm:gap-1 text-[#B58A5A] shrink-0">
                              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                              <span className="font-bold text-slate-800">{product.rating}</span>
                              <span className="text-slate-400 hidden sm:inline">({product.reviewsCount})</span>
                            </div>
                          </div>

                          <h3 className="font-serif text-xs sm:text-base font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors hover:underline line-clamp-2 min-h-[32px] sm:min-h-0">
                            {product.name}
                          </h3>

                          <p className="hidden sm:block text-xs text-slate-500 line-clamp-2 font-light">
                            {product.description}
                          </p>
                        </Link>

                        {/* Price & Add to Cart */}
                        <div className="pt-2 sm:pt-3 border-t border-[#EFE9DD] flex items-center justify-between gap-1">
                          <Link href={`/product/${product.id}`} className="cursor-pointer">
                            <div className="flex items-baseline gap-1 sm:gap-1.5">
                              <span className="text-sm sm:text-lg font-bold text-[#1F3A2E]">₹{product.price}</span>
                              {product.originalPrice && (
                                <span className="text-[10px] sm:text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                              )}
                            </div>
                            <span className="hidden sm:block text-[10px] text-emerald-700 font-medium">Taxes Included</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product, 1);
                            }}
                            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#1F3A2E] hover:bg-[#15271F] text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4A373]" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-[#1F3A2E] text-[#1F3A2E] hover:text-white border border-[#EFE9DD] font-semibold text-xs tracking-wider uppercase transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Load More Formulations</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>

        <Footer />

        {/* Modals */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer />

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(product) => setQuickViewProduct(product)}
        />

      </div>
    </SmoothScroll>
  );
}
