'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4500) => {
      if (!message) return;
      const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, type, duration };

      setToasts((prev) => {
        // Limit max concurrent visible toasts to 3 so it never clutters mobile screens
        const existing = prev.slice(-2);
        return [...existing, newToast];
      });

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Global window event listener so any callback can trigger toasts anywhere
  useEffect(() => {
    const handleCustomToast = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        type?: ToastType;
        duration?: number;
      }>;
      if (customEvent.detail?.message) {
        showToast(
          customEvent.detail.message,
          customEvent.detail.type || 'info',
          customEvent.detail.duration || 4500
        );
      }
    };

    window.addEventListener('labdhi-toast', handleCustomToast);
    return () => {
      window.removeEventListener('labdhi-toast', handleCustomToast);
    };
  }, [showToast]);

  const toastHelpers = {
    success: (msg: string, d?: number) => showToast(msg, 'success', d),
    error: (msg: string, d?: number) => showToast(msg, 'error', d),
    warning: (msg: string, d?: number) => showToast(msg, 'warning', d),
    info: (msg: string, d?: number) => showToast(msg, 'info', d),
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        toast: toastHelpers,
      }}
    >
      {children}

      {/* FIXED FLOATING TOASTER CONTAINER: Always stays on top of the viewport even when scrolled */}
      <div
        aria-live="assertive"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none w-[92vw] max-w-md flex flex-col items-center gap-2.5 transition-all duration-300"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <ToastCard key={item.id} item={item} onDismiss={() => removeToast(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const { type, message } = item;

  const styleConfig = {
    success: {
      bg: 'bg-white/95 backdrop-blur-md border-emerald-500/40 text-emerald-950',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
      accentBar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-white/95 backdrop-blur-md border-red-500/40 text-red-950',
      badgeBg: 'bg-red-50 text-red-700 border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
      accentBar: 'bg-red-500',
    },
    warning: {
      bg: 'bg-white/95 backdrop-blur-md border-amber-500/40 text-amber-950',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
      accentBar: 'bg-amber-500',
    },
    info: {
      bg: 'bg-white/95 backdrop-blur-md border-[#1F3A2E]/30 text-[#1F3A2E]',
      badgeBg: 'bg-[#F8F6F0] text-[#1F3A2E] border-[#EFE9DD]',
      icon: <Info className="w-5 h-5 text-[#1F3A2E] shrink-0 mt-0.5" />,
      accentBar: 'bg-[#1F3A2E]',
    },
  }[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      className={`pointer-events-auto relative w-full flex items-start gap-3 p-4 rounded-2xl border shadow-xl shadow-black/10 overflow-hidden ${styleConfig.bg}`}
      role="alert"
    >
      {/* Visual Accent bar on left edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styleConfig.accentBar}`} />

      {/* Icon */}
      <div className="pl-1">{styleConfig.icon}</div>

      {/* Message Text */}
      <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed break-words pr-1">
        {message}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={onDismiss}
        type="button"
        className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Global helper callable from anywhere (even outside React tree)
 */
export const dispatchGlobalToast = (message: string, type: ToastType = 'info', duration = 4500) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('labdhi-toast', {
        detail: { message, type, duration },
      })
    );
  }
};
