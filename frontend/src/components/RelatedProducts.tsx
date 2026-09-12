'use client';

import { PRODUCTS } from '../services/mockData';
import { Product } from '../types';
import Link from 'next/link';
import { Star, ShoppingBag, Leaf } from 'lucide-react';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  onAddToCart: (product: Product, quantity?: number) => void;
  onQuickView?: (product: Product) => void;
}

export default function RelatedProducts({
  currentProductId,
  category,
  onAddToCart,
}: RelatedProductsProps) {
  const relatedList = PRODUCTS.filter(
    (p) => p.id !== currentProductId && p.category.toLowerCase() === category.toLowerCase()
  ).slice(0, 4);

  const finalItems = relatedList.length >= 3 ? relatedList : PRODUCTS.filter((p) => p.id !== currentProductId).slice(0, 4);

  if (finalItems.length === 0) return null;

  return (
    <section className="space-y-6 pt-12 border-t border-[#EFE9DD]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#71846C] text-xs font-semibold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>Complete Your Wellness Routine</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            Related Herbal Formulations
          </h2>
        </div>

        <Link
          href="/shop"
          className="text-xs font-bold text-[#1F3A2E] hover:underline"
        >
          View All Formulations →
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {finalItems.map((product) => (
          <div
            key={product.id}
            className="group rounded-2xl bg-white border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Clickable Image Box */}
            <Link
              href={`/product/${product.id}`}
              className="block relative aspect-square bg-[#F8F6F0] overflow-hidden cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

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
                  <span className="text-[#71846C] font-semibold uppercase tracking-wider truncate mr-1">{product.category}</span>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-[#B58A5A] shrink-0">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                    <span className="font-bold text-slate-800">{product.rating}</span>
                  </div>
                </div>

                <h3 className="font-serif text-xs sm:text-base font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors line-clamp-2 min-h-[32px] sm:min-h-0">
                  {product.name}
                </h3>
              </Link>

              {/* Price & Action */}
              <div className="pt-2 sm:pt-3 border-t border-[#EFE9DD] flex items-center justify-between gap-1">
                <Link href={`/product/${product.id}`} className="text-sm sm:text-base font-bold text-[#1F3A2E] cursor-pointer">
                  ₹{product.price}
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToCart(product, 1);
                  }}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#D4A373]" />
                  <span>Add</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
