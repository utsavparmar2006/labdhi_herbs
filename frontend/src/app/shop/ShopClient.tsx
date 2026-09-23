'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SmoothScroll from '../../components/SmoothScroll';
import Header from '../../components/Header';
import ShopHero from '../../components/ShopHero';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import Footer from '../../components/Footer';
import { MAIN_CATEGORIES } from '../../services/mockData';
import { getCategories } from '../../services/api';
import { MainCategory } from '../../types';
import { useCart } from '../../context/CartContext';
import { ArrowRight, CheckCircle2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShopClient() {
  const router = useRouter();
  const { cartCount, openCart, isCartOpen, closeCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [categories, setCategories] = useState<MainCategory[]>(
    MAIN_CATEGORIES.filter((mc) => mc.id !== 'all')
  );

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const dynamicCats = await getCategories();
        if (dynamicCats && dynamicCats.length > 0 && isMounted) {
          setCategories(dynamicCats.filter((mc) => mc.id !== 'all'));
        }
      } catch (e) {
        // Fallback to initial mock categories
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleCategories = categories;

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans">

        <Header
          cartCount={cartCount}
          onOpenCart={openCart}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        <ShopHero activeCategory="All" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

          {/* Category Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE9DD] pb-5">
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1A201C]">
                Care Categories
              </h2>
              <span className="text-xs text-slate-500 font-light hidden sm:inline">
                • Select a discipline to discover targeted botanical formulations
              </span>
            </div>
            <span className="text-xs font-semibold text-[#71846C] tracking-wide">
              {visibleCategories.length} Categories Available
            </span>
          </div>

          {/* Main Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {visibleCategories.map((mainCat, idx) => (
              <motion.div
                key={mainCat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.07 }}
              >
                <Link
                  href={`/shop/${mainCat.id}`}
                  className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden flex flex-col justify-end cursor-pointer block border border-[#EFE9DD] hover:border-[#1F3A2E]/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${mainCat.image})` }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14261E] via-[#14261E]/60 to-black/10 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                  {/* Sub-category count badge */}
                  <div className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold border border-white/20">
                    {mainCat.subCategories.filter(s => s.slug !== 'All').length} Sub-Categories
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 p-6 text-white space-y-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight group-hover:text-[#D4A373] transition-colors duration-300">
                      {mainCat.name}
                    </h2>
                    <p className="text-xs text-emerald-100/75 font-light line-clamp-2 leading-relaxed">
                      {mainCat.description}
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-300 group-hover:text-[#D4A373] transition-colors group-hover:translate-x-1 duration-300">
                      <span>Explore Formulations</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

        </main>

        <Footer />

        <CartDrawer />

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(product) => {
            setIsSearchOpen(false);
            router.push(`/product/${product.id}`);
          }}
        />

      </div>
    </SmoothScroll>
  );
}
