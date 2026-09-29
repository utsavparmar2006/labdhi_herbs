'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, ArrowRight, X, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface LoginRequiredCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  pendingProduct?: {
    product: Product;
    quantity: number;
  } | null;
}

export default function LoginRequiredCartModal({
  isOpen,
  onClose,
  onOpenLogin,
  pendingProduct,
}: LoginRequiredCartModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#F8F6F0] rounded-3xl shadow-2xl border border-[#EFE9DD] overflow-hidden z-10 my-8 text-left"
        >
          {/* Header Banner */}
          <div className="bg-[#14261E] text-white px-6 sm:px-7 pt-6 pb-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#D4A373]/20 rounded-full blur-2xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3 h-3 text-[#D4A373]" />
              <span>Login Required</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug flex items-center gap-2">
              <span>Sign in to Add to Cart</span>
              <span className="text-lg">🛒</span>
            </h3>
            <p className="text-xs text-emerald-100/80 mt-1 font-light leading-relaxed">
              Please log in or create a free account to add items to your shopping cart and continue checkout.
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* Pending Product Preview Card */}
            {pendingProduct?.product && (
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#EFE9DD]">
                  <img
                    src={pendingProduct.product.image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=300'}
                    alt={pendingProduct.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Selected Item</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#14261E] truncate">
                    {pendingProduct.product.name}
                  </h4>
                  <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="font-extrabold text-[#1F3A2E]">
                      ₹{pendingProduct.product.price}
                    </span>
                    {pendingProduct.quantity > 1 && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Qty: {pendingProduct.quantity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Benefits List */}
            <div className="space-y-2.5 text-xs text-slate-700 bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  🛍️
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Saved Shopping Cart:</span>{' '}
                  <span className="text-slate-600">Access your selected items across phone, tablet, and laptop.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  ⚡
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Quick 1-Click Checkout:</span>{' '}
                  <span className="text-slate-600">Fast ordering with saved delivery addresses and tracking.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                  🎁
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Member Exclusive Discounts:</span>{' '}
                  <span className="text-slate-600">Unlock your 10% welcome coupon code upon joining.</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              New to Labdhi Herbs or already have an account? Sign in now to proceed with your order.
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full py-3.5 px-6 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
              >
                <LogIn className="w-4 h-4 text-[#D4A373]" />
                <span>Login / Create Account Now</span>
                <ArrowRight className="w-4 h-4 text-[#D4A373]" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
