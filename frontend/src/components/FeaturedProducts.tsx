'use me';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '../services/mockData';
import { getProducts } from '../services/api';
import { Product } from '../types';
import { Leaf, ArrowRight } from 'lucide-react';

interface FeaturedProductsProps {
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  selectedCategoryFilter?: string;
  products?: Product[];
}

export default function FeaturedProducts({
  onAddToCart,
  onQuickView,
  selectedCategoryFilter,
  products: initialProducts,
}: FeaturedProductsProps) {
  const [productList, setProductList] = useState<Product[]>(initialProducts || []);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        const res = await getProducts({ limit: 100 });
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setProductList(res.data);
        }
      } catch (err) {
        console.warn('Using default featured products:', err);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const sourceProducts = productList.length > 0 ? productList : PRODUCTS;

  // Filter only products marked as featured (show in this section on home page)
  const featuredOnly = sourceProducts.filter((p) => (p as any).featured === true);
  const activeProducts = featuredOnly.length > 0 ? featuredOnly : sourceProducts;

  const filteredProducts = selectedCategoryFilter && selectedCategoryFilter !== 'All'
    ? activeProducts.filter((p) =>
        p.category?.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
        p.mainCategory?.toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
        selectedCategoryFilter.toLowerCase().includes(p.category?.toLowerCase() || '')
      )
    : activeProducts;

  // Prepare 3 columns for infinite vertical marquee scrolling
  const col1 = filteredProducts.filter((_, idx) => idx % 3 === 0);
  const col2 = filteredProducts.filter((_, idx) => idx % 3 === 1);
  const col3 = filteredProducts.filter((_, idx) => idx % 3 === 2);

  // If column array is short, repeat items to ensure continuous infinite loop
  const makeInfinite = (arr: Product[]) => {
    if (arr.length === 0) return activeProducts;
    if (arr.length < 4) return [...arr, ...arr, ...arr, ...arr];
    return [...arr, ...arr];
  };

  const listCol1 = makeInfinite(col1);
  const listCol2 = makeInfinite(col2.length ? col2 : col1);
  const listCol3 = makeInfinite(col3.length ? col3 : col1);

  return (
    <section id="products" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* Centered Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 border-b border-[#EFE9DD] pb-6">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A201C] tracking-tight">
          Handcrafted Herbal Remedies
        </h2>
        <p className="text-slate-600 text-sm font-light">
          Hover over any image to pause the vertical auto-scroll. Click to view product details.
        </p>
      </div>

      {/* 3-Column Vertical Auto-Scrolling Product Showcase */}
      <div className="relative h-[650px] overflow-hidden rounded-3xl bg-[#F8F6F0] p-4 sm:p-6 border border-[#EFE9DD] shadow-inner group/scroll-container">
        
        {/* Subtle Top & Bottom Gradient Masks for Smooth Dissolve */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#F8F6F0] to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#F8F6F0] to-transparent z-20 pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          
          {/* Column 1: Vertical Scroll Upwards */}
          <div className="relative overflow-hidden h-full">
            <div className="flex flex-col gap-6 animate-vertical-scroll-up group-hover/scroll-container:[animation-play-state:paused]">
              {listCol1.map((product, i) => (
                <ProductImageCard key={`col1-${product.id}-${i}`} product={product} />
              ))}
            </div>
          </div>

          {/* Column 2: Vertical Scroll Downwards (Counter-Motion) */}
          <div className="relative overflow-hidden h-full hidden sm:block">
            <div className="flex flex-col gap-6 animate-vertical-scroll-down group-hover/scroll-container:[animation-play-state:paused]">
              {listCol2.map((product, i) => (
                <ProductImageCard key={`col2-${product.id}-${i}`} product={product} />
              ))}
            </div>
          </div>

          {/* Column 3: Vertical Scroll Upwards */}
          <div className="relative overflow-hidden h-full hidden lg:block">
            <div className="flex flex-col gap-6 animate-vertical-scroll-up group-hover/scroll-container:[animation-play-state:paused]">
              {listCol3.map((product, i) => (
                <ProductImageCard key={`col3-${product.id}-${i}`} product={product} />
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}

{/* Pure Image Product Card Component */}
function ProductImageCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="block group">
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-[#EFE9DD] bg-white transition-all duration-500 cursor-pointer">
        {/* Full Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Tag Overlay Badge */}
        {product.tag && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider shadow-md z-10">
            {product.tag}
          </span>
        )}

        {/* Hover Translucent Dark Overlay with Title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 p-6 flex flex-col justify-end text-white z-10">
          <span className="text-[10px] text-[#D4A373] font-bold uppercase tracking-wider">
            {product.category}
          </span>

          <h3 className="font-serif text-lg font-bold text-white line-clamp-2 leading-tight">
            {product.name}
          </h3>

          <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#D4A373]">
            <span>₹{product.price} • View Product</span>
            <div className="w-8 h-8 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center border border-[#D4A373]/30">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
