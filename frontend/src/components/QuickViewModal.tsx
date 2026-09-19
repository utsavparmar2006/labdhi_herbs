'use me';
'use client';

import { Product } from '../types';
import { X, Star, ShoppingBag, Check, ShieldCheck, Leaf } from 'lucide-react';
import { useState } from 'react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function QuickViewModal({ product, onClose, onAddToCart }: QuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-[#F8F6F0] rounded-3xl overflow-hidden shadow-2xl border border-[#EFE9DD] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-slate-100 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.tag && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider">
                {product.tag}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#71846C] uppercase tracking-wider">
                  {product.category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1A201C]">
                  {product.name}
                </h3>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center justify-between border-y border-[#EFE9DD] py-3">
                <div className="flex items-center gap-1.5 text-[#B58A5A] text-xs">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold text-slate-800">{product.rating}</span>
                  <span className="text-slate-400">({product.reviewsCount} reviews)</span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#1F3A2E]">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-[#EFE9DD]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Select Quantity:</span>
                <div className="flex items-center border border-[#EFE9DD] rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-bold text-[#1F3A2E]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className={`w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                  isAdded ? 'bg-emerald-600 text-white' : 'bg-[#1F3A2E] hover:bg-[#15271F] text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
                    <span>Add {quantity} to Bag • ₹{product.price * quantity}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
