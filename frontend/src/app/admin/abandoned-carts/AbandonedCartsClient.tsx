'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { apiRequest } from '../../../services/api';
import {
  ShoppingCart,
  TrendingDown,
  RotateCcw,
  Mail,
  Phone,
  Send,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  Search,
  MessageCircle,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AbandonedCartItem {
  _id: string;
  guestId?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  items: Array<{
    product: {
      id: string;
      name: string;
      price: number;
      image: string;
      category?: string;
    };
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  status: 'active' | 'converted' | 'abandoned';
  abandonedAt?: string;
  recoveryRemindersCount: number;
  lastReminderSentAt?: string;
  lastActivityAt: string;
  recoveryCoupon?: string;
}

interface AbandonedStats {
  totalAbandoned: number;
  lostRevenue: number;
  totalRecovered: number;
  recoveryRate: number;
}

export default function AbandonedCartsClient() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [carts, setCarts] = useState<AbandonedCartItem[]>([]);
  const [stats, setStats] = useState<AbandonedStats>({
    totalAbandoned: 0,
    lostRevenue: 0,
    totalRecovered: 0,
    recoveryRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCart, setSelectedCart] = useState<AbandonedCartItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('HERBAL10');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchAbandonedCarts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{ carts: AbandonedCartItem[]; stats: AbandonedStats }>(
        '/v1/cart/abandoned'
      );
      if (res.success && res.data) {
        setCarts(res.data.carts || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (e) {
      console.error('Failed to load abandoned carts', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAbandonedCarts();
  }, [fetchAbandonedCarts]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenRemindModal = (cart: AbandonedCartItem) => {
    setSelectedCart(cart);
    setDiscountCode('HERBAL10');
    setCustomNote('Complete your order today and enjoy an extra 10% discount on pure Ayurvedic care.');
    setModalOpen(true);
  };

  const handleSendReminder = async () => {
    if (!selectedCart) return;
    setIsSending(true);

    try {
      const res = await apiRequest(`/v1/cart/abandoned/${selectedCart._id}/remind`, {
        method: 'POST',
        body: JSON.stringify({
          discountCode,
          customMessage: customNote,
        }),
      });

      if (res.success) {
        showToast(`Recovery email dispatched to ${selectedCart.customer?.email}`);
        setModalOpen(false);
        fetchAbandonedCarts();
      } else {
        alert(res.message || 'Failed to send recovery reminder');
      }
    } catch (e: any) {
      alert(e.message || 'Error triggering recovery');
    } finally {
      setIsSending(false);
    }
  };

  const filteredCarts = carts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = c.customer?.fullName?.toLowerCase() || '';
    const email = c.customer?.email?.toLowerCase() || '';
    const phone = c.customer?.phone?.toLowerCase() || '';
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="flex h-screen bg-[#F8F6F0] overflow-hidden font-sans">
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          title="Abandoned Carts Recovery"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 right-6 z-50 bg-[#3A4D39] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-white/20"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header & Stats Cards */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#14261E]">
                Abandoned Carts Recovery
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Recover lost revenue by engaging shoppers who left natural herbal formulations in their cart.
              </p>
            </div>
            <button
              onClick={fetchAbandonedCarts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EFE9DD] rounded-xl text-slate-700 hover:bg-[#F8F6F0] transition-colors text-sm font-medium shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Abandoned Carts
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">{stats.totalAbandoned}</p>
              <p className="text-xs text-amber-600 mt-1 font-medium">Inactive &gt; 30 mins</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Lost Revenue
                </span>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-2">₹{stats.lostRevenue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-1">Ready for recovery</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Recovered Orders
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-2">{stats.totalRecovered}</p>
              <p className="text-xs text-emerald-600 mt-1 font-medium">Converted via reminders</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Recovery Rate
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-indigo-700 mt-2">{stats.recoveryRate}%</p>
              <p className="text-xs text-slate-400 mt-1">Average e-com: 12-18%</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, or 10-digit phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-hidden text-sm text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#EFE9DD] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EFE9DD] bg-[#F8F6F0]/60 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 sm:px-6">Customer</th>
                    <th className="py-3.5 px-4 sm:px-6">Formulations in Cart</th>
                    <th className="py-3.5 px-4 sm:px-6">Cart Total</th>
                    <th className="py-3.5 px-4 sm:px-6">Abandoned</th>
                    <th className="py-3.5 px-4 sm:px-6">Reminders</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD] text-sm">
                  {filteredCarts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        {loading ? 'Loading abandoned carts...' : 'No abandoned carts found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCarts.map((cart) => {
                      const hasEmail = Boolean(cart.customer?.email);
                      const hasPhone = Boolean(cart.customer?.phone);
                      const rawPhone = (cart.customer?.phone || '').replace(/\D/g, '');

                      const whatsappText = encodeURIComponent(
                        `Namaste ${cart.customer?.fullName || ''}, we noticed you left ${cart.items.length} items in your Labdhi Herbs cart. Complete your order now with coupon HERBAL10 for 10% off: https://labdhiherbs.com/checkout`
                      );

                      return (
                        <tr key={cart._id} className="hover:bg-[#F8F6F0]/40 transition-colors">
                          <td className="py-4 px-4 sm:px-6">
                            <div className="font-semibold text-slate-900">
                              {cart.customer?.fullName || 'Anonymous Visitor'}
                            </div>
                            <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
                              {hasEmail ? (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  {cart.customer?.email}
                                </span>
                              ) : (
                                <span className="text-amber-600 text-[11px]">No email provided</span>
                              )}
                              {hasPhone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  {cart.customer?.phone}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex flex-col gap-1.5 max-w-xs">
                              {cart.items.slice(0, 2).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  {item.product?.image ? (
                                    <img
                                      src={item.product.image}
                                      alt=""
                                      className="w-7 h-7 rounded-md object-cover border border-[#EFE9DD]"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-md bg-[#F8F6F0] flex items-center justify-center">
                                      <Sparkles className="w-3.5 h-3.5 text-[#3A4D39]" />
                                    </div>
                                  )}
                                  <span className="text-xs font-medium text-slate-700 truncate">
                                    {item.product?.name || 'Herbal Product'}
                                    <span className="text-slate-400 font-normal"> (x{item.quantity})</span>
                                  </span>
                                </div>
                              ))}
                              {cart.items.length > 2 && (
                                <span className="text-[11px] text-[#3A4D39] font-medium">
                                  +{cart.items.length - 2} more items
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 sm:px-6 font-bold text-[#3A4D39]">
                            ₹{cart.subtotal.toLocaleString('en-IN')}
                          </td>

                          <td className="py-4 px-4 sm:px-6 text-xs text-slate-500">
                            <div className="flex items-center gap-1 text-amber-700 font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTimeAgo(cart.lastActivityAt)}
                            </div>
                          </td>

                          <td className="py-4 px-4 sm:px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                cart.recoveryRemindersCount > 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {cart.recoveryRemindersCount} sent
                            </span>
                            {cart.lastReminderSentAt && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                Last: {formatTimeAgo(cart.lastReminderSentAt)}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {hasEmail && (
                                <button
                                  onClick={() => handleOpenRemindModal(cart)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3A4D39] text-white text-xs font-medium rounded-lg hover:bg-[#2C3B2B] transition-colors shadow-xs"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  Send Email
                                </button>
                              )}

                              {hasPhone && rawPhone.length >= 10 && (
                                <a
                                  href={`https://wa.me/91${rawPhone.slice(-10)}?text=${whatsappText}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Recovery Reminder Modal */}
      <AnimatePresence>
        {modalOpen && selectedCart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EFE9DD] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
                <div className="flex items-center gap-2 text-[#3A4D39]">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Send Recovery Reminder
                  </h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-500">Recipient</p>
                <p className="font-semibold text-slate-800">
                  {selectedCart.customer?.fullName || 'Customer'} (
                  {selectedCart.customer?.email})
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Cart Subtotal: <strong className="text-[#3A4D39]">₹{selectedCart.subtotal}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Discount Coupon Code
                </label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-[#EFE9DD] rounded-xl text-sm font-semibold tracking-wider text-[#3A4D39] uppercase focus:outline-hidden focus:border-[#3A4D39]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Personalized Message
                </label>
                <textarea
                  rows={3}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EFE9DD] rounded-xl text-sm text-slate-800 focus:outline-hidden focus:border-[#3A4D39]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  disabled={isSending}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#3A4D39] text-white text-sm font-semibold rounded-xl hover:bg-[#2C3B2B] transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Dispatch Recovery Email
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
