'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SmoothScroll from '../../../components/SmoothScroll';
import Header from '../../../components/Header';
import CartDrawer from '../../../components/CartDrawer';
import AuthModal from '../../../components/AuthModal';
import SearchModal from '../../../components/SearchModal';
import Footer from '../../../components/Footer';
import { MainCategory } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  mainCategory: MainCategory;
}

export default function CategoryPageClient({ mainCategory }: Props) {
  const router = useRouter();
  const { cartCount, openCart } = useCart();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sub-categories to display as cards (exclude generic 'All')
  const subCategoryCards = mainCategory.subCategories.filter((sc) => sc.slug !== 'All');

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans">

        <Header
          cartCount={cartCount}
          onOpenCart={openCart}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Category Hero Banner with safe top padding for fixed Header */}
        <div
          className="relative pt-36 pb-12 sm:pt-40 sm:pb-16 overflow-hidden"
          style={{
            backgroundImage: `url(${mainCategory.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#14261E]/95 via-[#14261E]/80 to-black/40" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col justify-center gap-3.5">
            
            {/* Breadcrumb & Back button */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-emerald-200 text-xs font-semibold hover:text-[#D4A373] transition-colors w-fit bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Main Categories</span>
              </Link>

              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-200/70 font-medium">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
                <span>/</span>
                <span className="text-[#D4A373] font-semibold">{mainCategory.name}</span>
              </div>
            </div>

            <div>
              <p className="text-[#D4A373] text-xs font-bold uppercase tracking-widest mb-1.5">
                Ayurvedic Collection
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                {mainCategory.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-emerald-100/85 font-light max-w-xl leading-relaxed">
                {mainCategory.description}
              </p>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EFE9DD] pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Select Sub-Category</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                Explore {mainCategory.name} Formulations
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 font-light">
                Click a sub-category card below to view all matching herbal formulations.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-light pb-1">
              {subCategoryCards.length} Sub-Categories Available
            </span>
          </div>

          {/* Sub-Category Visual Cards Grid (Matching the Main Category cards style) */}
          <div className={`grid gap-6 ${
            subCategoryCards.length === 1
              ? 'grid-cols-1 sm:grid-cols-1 max-w-md'
              : subCategoryCards.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {subCategoryCards.map((subCat, idx) => {
              const cardImage =
                subCat.image ||
                mainCategory.image ||
                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';

              return (
                <motion.div
                  key={subCat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08 }}
                >
                  <Link
                    href={`/shop/${mainCategory.id}/${subCat.id}`}
                    className="group relative h-72 sm:h-80 rounded-3xl overflow-hidden flex flex-col justify-end cursor-pointer block border border-[#EFE9DD] hover:border-[#1F3A2E]/50 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Background Image with hover zoom */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${cardImage})` }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14261E] via-[#14261E]/60 to-black/10 opacity-90 group-hover:opacity-95 transition-opacity duration-300" />

                    {/* Card Content */}
                    <div className="relative z-10 p-6 text-white space-y-2">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight group-hover:text-[#D4A373] transition-colors duration-300">
                        {subCat.name}
                      </h3>

                      {subCat.description && (
                        <p className="text-xs text-emerald-100/75 font-light line-clamp-2 leading-relaxed">
                          {subCat.description}
                        </p>
                      )}

                      <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-300 group-hover:text-[#D4A373] transition-colors group-hover:translate-x-1 duration-300">
                        <span>View Formulations</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
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
