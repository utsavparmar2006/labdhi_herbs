'use client';

import { useRouter } from 'next/navigation';
import { CartItem } from '../types';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  items?: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
}

export default function CartDrawer({
  isOpen: propIsOpen,
  onClose: propOnClose,
  items: propItems,
  onUpdateQuantity: propOnUpdate,
  onRemoveItem: propOnRemove,
}: CartDrawerProps) {
  const router = useRouter();
  const cartContext = useCart();

  const isOpen = propIsOpen !== undefined ? propIsOpen : cartContext.isCartOpen;
  const onClose = propOnClose || cartContext.closeCart;
  const items = propItems || cartContext.items;
  const onUpdateQuantity = propOnUpdate || cartContext.updateQuantity;
  const onRemoveItem = propOnRemove || cartContext.removeFromCart;

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.product?.price || 0) * item.quantity,
    0
  );

  const handleProceedToCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8F6F0] shadow-2xl border-l border-[#EFE9DD] flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#1F3A2E] text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D4A373]" />
              <h3 className="font-serif text-lg font-bold">Your Herbal Shopping Bag</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-[#1A201C]">Your Bag is Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Explore our pure Ayurvedic formulations and add natural remedies to your bag.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] text-white text-xs font-semibold shadow-md cursor-pointer hover:bg-[#15271F] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-4 rounded-2xl bg-white border border-[#EFE9DD] flex gap-4 items-center shadow-xs"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                    }}
                  />

                  <div className="flex-1 space-y-1">
                    <h5 className="font-serif text-xs font-bold text-[#1A201C] line-clamp-1">
                      {product.name}
                    </h5>
                    <span className="text-[10px] text-[#71846C]">{product.category}</span>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-[#1F3A2E]">
                        ₹{Number(product.price || 0) * quantity}
                      </span>

                      <div className="flex items-center border border-[#EFE9DD] rounded-lg bg-slate-50 overflow-hidden text-xs">
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-[#1F3A2E]">{quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EFE9DD] bg-white space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-800">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Shipping:</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1F3A2E] pt-2 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="w-full py-4 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#D4A373]" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Secure Checkout & Free All-India Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
