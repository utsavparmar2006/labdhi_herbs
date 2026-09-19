'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import { useCart } from '../../context/CartContext';
import { getMyOrders } from '../../services/api';
import { Order, Product, OrderStatusType } from '../../types';
import AdminInvoiceModal from '../admin/orders/components/AdminInvoiceModal';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronRight,
  Search,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  MapPin,
  CreditCard,
  Banknote,
  Receipt,
  User as UserIcon,
  Lock,
  Phone,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrdersClient() {
  const router = useRouter();
  const { items, cartCount, openCart, isCartOpen, closeCart, removeFromCart, updateQuantity, addToCart } = useCart();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [userLoggedIn, setUserLoggedIn] = useState<boolean | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMessage('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setUserLoggedIn(false);
      setIsLoading(false);
      return;
    }

    setUserLoggedIn(true);

    try {
      const res = await getMyOrders();
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
        if (res.message) setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to retrieve your order history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleAuthChange = () => {
      fetchOrders();
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleCopyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(orderId);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handleReorder = (order: Order) => {
    setReorderingId(order.orderId);
    try {
      order.items.forEach((item) => {
        const dummyProduct: Product = {
          id: item.product.id,
          name: item.product.name,
          category: item.product.category || 'Herbal Formulations',
          categoryId: 'all',
          price: item.price,
          rating: 5,
          reviewsCount: 1,
          image: item.product.image || '/uploads/logo/Main-logo-531.jpg',
          description: item.product.name,
          benefits: [],
          ingredients: [],
          usage: '',
        };
        addToCart(dummyProduct, item.quantity, false);
      });
      setTimeout(() => {
        setReorderingId(null);
        openCart();
      }, 400);
    } catch (e) {
      setReorderingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'pending':
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Order Received</span>
          </span>
        );
      case 'accepted':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Order Accepted</span>
          </span>
        );
      case 'dispatched':
      case 'processing':
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3.5 h-3.5 text-purple-600" />
            <span>Dispatched</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'returned_by_customer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            <span>Returned by Customer</span>
          </span>
        );
      case 'cancelled_by_seller':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            <span>Cancelled by Seller</span>
          </span>
        );
      case 'return_received':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <Check className="w-3.5 h-3.5 text-slate-600" />
            <span>Return Received</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (statusFilter === 'active') {
      if (['delivered', 'cancelled'].includes(order.orderStatus)) return false;
    } else if (statusFilter === 'delivered') {
      if (order.orderStatus !== 'delivered') return false;
    } else if (statusFilter === 'cancelled') {
      if (order.orderStatus !== 'cancelled') return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = order.orderId.toLowerCase().includes(q);
      const matchItems = order.items.some((i) => i.product.name.toLowerCase().includes(q));
      const matchCity = order.shippingAddress.city.toLowerCase().includes(q);
      return matchId || matchItems || matchCity;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] flex flex-col font-sans selection:bg-[#D4A373]/30">
      {/* Universal Header */}
      <Header
        cartCount={cartCount}
        onOpenCart={openCart}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <main className="flex-1 pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-[#71846C] mb-6">
          <Link href="/" className="hover:text-[#1F3A2E] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />
          <Link href="/profile" className="hover:text-[#1F3A2E] transition-colors">
            My Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D4A373]" />
          <span className="text-[#1F3A2E] font-bold">My Orders</span>
        </nav>

        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE9DD] shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-1">
              <Package className="w-4 h-4" />
              <span>Customer Orders Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3A2E]">
              My Orders & Delivery Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Track real-time shipment updates, download official GST invoices, and reorder your genuine Ayurvedic formulations.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/profile"
              className="px-4 py-2.5 rounded-full bg-[#F8F6F0] hover:bg-[#EFE9DD] text-[#1F3A2E] text-xs font-bold border border-[#EFE9DD] transition-all flex items-center gap-2"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Account Profile</span>
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Explore Formulations</span>
            </Link>
          </div>
        </div>

        {/* Guest / Not Logged In State */}
        {userLoggedIn === false ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFE9DD] shadow-lg text-center max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-[#F8F6F0] border border-[#EFE9DD] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#1F3A2E]">
              <Lock className="w-8 h-8 text-[#D4A373]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1F3A2E] mb-2">
              Sign In to View Your Orders
            </h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Please log in with your registered email or phone number to access your past orders, delivery tracking numbers, and download receipts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-6 py-3 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-[#D4A373]" />
                <span>Sign In or Register</span>
              </button>
              <Link
                href="/"
                className="px-6 py-3 rounded-full bg-[#F8F6F0] hover:bg-[#EFE9DD] text-[#1F3A2E] font-bold text-sm border border-[#EFE9DD] transition-all flex items-center justify-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div>
            {/* Filter Tabs & Search Bar */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#EFE9DD] shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Status Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    statusFilter === 'all'
                      ? 'bg-[#1F3A2E] text-white shadow-xs'
                      : 'bg-[#F8F6F0] text-slate-600 hover:bg-[#EFE9DD]'
                  }`}
                >
                  All Orders ({orders.length})
                </button>
                <button
                  onClick={() => setStatusFilter('active')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    statusFilter === 'active'
                      ? 'bg-[#1F3A2E] text-white shadow-xs'
                      : 'bg-[#F8F6F0] text-slate-600 hover:bg-[#EFE9DD]'
                  }`}
                >
                  Active / In Transit
                </button>
                <button
                  onClick={() => setStatusFilter('delivered')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    statusFilter === 'delivered'
                      ? 'bg-[#1F3A2E] text-white shadow-xs'
                      : 'bg-[#F8F6F0] text-slate-600 hover:bg-[#EFE9DD]'
                  }`}
                >
                  Delivered
                </button>
                <button
                  onClick={() => setStatusFilter('cancelled')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    statusFilter === 'cancelled'
                      ? 'bg-[#1F3A2E] text-white shadow-xs'
                      : 'bg-[#F8F6F0] text-slate-600 hover:bg-[#EFE9DD]'
                  }`}
                >
                  Cancelled
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative sm:w-72">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID or Item..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-xs focus:bg-white focus:outline-none focus:border-[#1F3A2E] transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="bg-white rounded-3xl p-16 border border-[#EFE9DD] shadow-sm text-center">
                <div className="inline-block w-10 h-10 border-3 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-semibold text-[#1F3A2E]">Fetching your order history...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl p-12 sm:p-16 border border-[#EFE9DD] shadow-sm text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-[#F8F6F0] border border-[#EFE9DD] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#1F3A2E]">
                  <ShoppingBag className="w-8 h-8 text-[#D4A373]" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#1F3A2E] mb-2">
                  {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No Orders Placed Yet'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search query or switching tabs.'
                    : 'Discover our handcrafted Ayurvedic hair oils, muscle balms, and pure herbal wellness formulations handcrafted in Surat, Gujarat.'}
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold tracking-wide transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4 text-[#D4A373]" />
                  <span>Explore Authentic Formulations</span>
                </Link>
              </div>
            ) : (
              /* Orders List */
              <div className="space-y-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.orderId}
                    className="bg-white rounded-3xl border border-[#EFE9DD] shadow-sm hover:shadow-md transition-all overflow-hidden"
                  >
                    {/* Order Card Header */}
                    <div className="bg-[#F8F6F0]/80 px-6 py-4 border-b border-[#EFE9DD] flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                        {/* Order ID & Copy */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#1F3A2E] tracking-wider font-mono">
                            {order.orderId}
                          </span>
                          <button
                            onClick={() => handleCopyOrderId(order.orderId)}
                            title="Copy Order ID"
                            className="p-1 text-slate-400 hover:text-[#1F3A2E] transition-colors rounded cursor-pointer"
                          >
                            {copiedOrderId === order.orderId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Order Date */}
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Payment Pill */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#EFE9DD] text-[#1F3A2E]">
                          {order.payment.method === 'online' ? (
                            <>
                              <CreditCard className="w-3 h-3 text-[#D4A373]" />
                              <span>Paid Online</span>
                            </>
                          ) : (
                            <>
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              <span>Cash on Delivery</span>
                            </>
                          )}
                        </span>

                        {/* Status Badge */}
                        {getStatusBadge(order.orderStatus)}
                      </div>
                    </div>

                    {/* Order Card Body: Items List */}
                    <div className="p-6 sm:p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Items Section (2 columns on lg) */}
                        <div className="lg:col-span-2 space-y-4">
                          <h4 className="text-xs font-bold text-[#1F3A2E] uppercase tracking-wider mb-2">
                            Items in this package ({order.items.length})
                          </h4>
                          <div className="divide-y divide-[#EFE9DD]/60">
                            {order.items.map((item, idx) => (
                              <div
                                key={`${item.product.id}-${idx}`}
                                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-3 sm:gap-4">
                                  {/* Item Image */}
                                  <div className="w-14 h-14 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.product.image ? (
                                      <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-6 h-6 text-slate-300" />
                                    )}
                                  </div>

                                  <div>
                                    <h5 className="text-xs sm:text-sm font-bold text-[#1F3A2E] line-clamp-1">
                                      {item.product.name}
                                    </h5>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {item.product.category || 'Herbal Care'} • Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="text-right shrink-0">
                                  <span className="text-xs sm:text-sm font-bold text-[#1F3A2E]">
                                    ₹{item.total}
                                  </span>
                                  {item.quantity > 1 && (
                                    <p className="text-[10px] text-slate-400">
                                      ₹{item.price} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address Summary (1 column on lg) */}
                        <div className="bg-[#F8F6F0]/60 rounded-2xl p-4 sm:p-5 border border-[#EFE9DD] flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F3A2E] mb-2">
                              <MapPin className="w-3.5 h-3.5 text-[#D4A373]" />
                              <span>Delivery Address</span>
                            </div>
                            <p className="text-xs font-bold text-[#1F3A2E]">
                              {order.shippingAddress.fullName}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {order.shippingAddress.address}
                              {order.shippingAddress.landmark && `, ${order.shippingAddress.landmark}`}
                              <br />
                              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                            </p>
                            <p className="text-[11px] text-slate-600 mt-2 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>+91 {order.shippingAddress.phone}</span>
                            </p>
                          </div>

                          {/* Quick Delivery / Tracking Tag */}
                          <div className="mt-4 pt-3 border-t border-[#EFE9DD] text-[11px] text-[#71846C] space-y-1">
                            {order.deliveryName || order.deliveryTrackId ? (
                              <div className="bg-[#1F3A2E]/5 rounded-xl p-2.5 border border-[#1F3A2E]/10">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F3A2E]">
                                    <Truck className="w-3.5 h-3.5 text-[#D4A373]" />
                                    <span>{order.deliveryName || 'Courier Partner'}</span>
                                  </div>
                                  <Link
                                    href={`/track-order?orderId=${order.orderId}`}
                                    className="text-[10px] font-bold text-[#1F3A2E] hover:underline flex items-center gap-0.5"
                                  >
                                    <span>Track</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </Link>
                                </div>
                                {order.deliveryTrackId && (
                                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                                    Tracking ID: <span className="font-bold text-[#1F3A2E]">{order.deliveryTrackId}</span>
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px]">
                                <Truck className="w-3.5 h-3.5 text-[#D4A373]" />
                                <span>Shipped via Bluedart / Delhivery Express</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Card Footer */}
                    <div className="bg-white px-6 sm:px-8 py-4 border-t border-[#EFE9DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Pricing Summary */}
                      <div className="flex items-center gap-4 sm:gap-6 text-xs text-slate-600">
                        <div>
                          <span>Subtotal: </span>
                          <span className="font-bold text-[#1F3A2E]">₹{order.pricing.subtotal}</span>
                        </div>
                        {order.pricing.discount > 0 && (
                          <div className="text-emerald-700">
                            <span>Discount: </span>
                            <span className="font-bold">-₹{order.pricing.discount}</span>
                          </div>
                        )}
                        <div>
                          <span>Delivery: </span>
                          <span className="font-bold text-emerald-700">FREE</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-[#1F3A2E]">Total: </span>
                          <span className="font-serif font-bold text-base text-[#1F3A2E]">
                            ₹{order.pricing.total}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Invoice Button */}
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3.5 py-2 rounded-xl bg-[#F8F6F0] hover:bg-[#EFE9DD] text-[#1F3A2E] text-xs font-bold border border-[#EFE9DD] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="View & Print Official GST Invoice"
                        >
                          <Printer className="w-3.5 h-3.5 text-[#D4A373]" />
                          <span>Invoice</span>
                        </button>

                        {/* Reorder Button */}
                        <button
                          onClick={() => handleReorder(order)}
                          disabled={reorderingId === order.orderId}
                          className="px-3.5 py-2 rounded-xl bg-[#F8F6F0] hover:bg-[#EFE9DD] text-[#1F3A2E] text-xs font-bold border border-[#EFE9DD] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <RotateCcw className={`w-3.5 h-3.5 text-[#D4A373] ${reorderingId === order.orderId ? 'animate-spin' : ''}`} />
                          <span>Reorder</span>
                        </button>

                        {/* Track Order Live */}
                        <Link
                          href={`/track-order?orderId=${order.orderId}`}
                          className="px-4 py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5 text-[#D4A373]" />
                          <span>Track Order</span>
                          <ArrowRight className="w-3 h-3 text-[#D4A373]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Universal Footer */}
      <Footer />

      {/* Official Tax Invoice Modal */}
      <AdminInvoiceModal
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
        order={selectedInvoiceOrder}
      />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          router.push(`/product/${p.id}`);
        }}
      />
    </div>
  );
}
