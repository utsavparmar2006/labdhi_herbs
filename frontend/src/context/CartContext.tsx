'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem } from '../types';
import LoginRequiredCartModal from '../components/LoginRequiredCartModal';
import AuthModal from '../components/AuthModal';

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number, autoOpen?: boolean) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openLoginPrompt: (product?: Product, quantity?: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'labdhi_cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Authentication prompt states for cart
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingItemToAdd, setPendingItemToAdd] = useState<{
    product: Product;
    quantity: number;
    autoOpen?: boolean;
  } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse cart items from storage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (after initial hydration)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart items to storage', e);
    }
  }, [items, isHydrated]);

  // Handle successful login: automatically add pending item & open cart
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const isLoggedIn = !!(userRaw && token);

        if (isLoggedIn && pendingItemToAdd) {
          const item = pendingItemToAdd;
          setPendingItemToAdd(null);
          setIsLoginPromptOpen(false);
          setIsAuthModalOpen(false);

          setItems((prev) => {
            const existingIdx = prev.findIndex((i) => i.product.id === item.product.id);
            if (existingIdx > -1) {
              const updated = [...prev];
              updated[existingIdx].quantity += item.quantity;
              return updated;
            }
            return [...prev, { product: item.product, quantity: item.quantity }];
          });

          // Smoothly reveal cart drawer
          setTimeout(() => {
            setIsCartOpen(true);
          }, 350);
        }
      } catch (e) {
        console.warn('Error syncing pending cart item on auth change', e);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pendingItemToAdd]);

  const addToCart = useCallback((product: Product, quantity = 1, autoOpen = false): boolean => {
    // Check if user is logged in
    const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const isLoggedIn = !!(userRaw && token);

    if (!isLoggedIn) {
      setPendingItemToAdd({ product, quantity, autoOpen });
      setIsLoginPromptOpen(true);
      return false;
    }

    setItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.product.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity }];
    });

    if (autoOpen) {
      setIsCartOpen(true);
    }
    return true;
  }, []);

  const openLoginPrompt = useCallback((product?: Product, quantity = 1) => {
    if (product) {
      setPendingItemToAdd({ product, quantity, autoOpen: true });
    }
    setIsLoginPromptOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      // Ignored
    }
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = items.reduce(
    (acc, item) => acc + Number(item.product.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        openLoginPrompt,
      }}
    >
      {children}

      {/* Login Required Modal for Add to Cart */}
      <LoginRequiredCartModal
        isOpen={isLoginPromptOpen}
        onClose={() => {
          setIsLoginPromptOpen(false);
          setPendingItemToAdd(null);
        }}
        onOpenLogin={() => {
          setIsLoginPromptOpen(false);
          setIsAuthModalOpen(true);
        }}
        pendingProduct={pendingItemToAdd}
      />

      {/* Auth Modal Triggered From Cart Login Prompt */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
