'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import AdminInvoiceModal from '../admin/orders/components/AdminInvoiceModal';
import { trackOrderByOrderId } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Order } from '../../types';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
  MapPin,
  Phone,
  Printer,
  ChevronRight,
  Calendar,
  IndianRupee,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrackOrderClient() {
  const router = useRouter();
  const { cartCount, openCart } = useCart();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('product_id') || searchParams.get('order_id') || searchParams.get('id') || '';

  const [orderInput, setOrderInput] = useState(initialOrderId);
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showInvoice, setShowInvoice] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleTrack = async (idToSearch?: string) => {
    const targetId = (idToSearch !== undefined ? idToSearch : orderInput).trim();
    if (!targetId) {
      setErrorMessage('Please enter an Order ID to track.');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');
    setOrderData(null);

    try {
      const res = await trackOrderByOrderId(targetId);
      if (res.success && res.data) {
        setOrderData(res.data);
      } else {
        setErrorMessage(
          res.message || `No active order found with ID "${targetId}". Please check your order confirmation details.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to connect to order tracking service. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId]);

  const getStatusText = (status?: string) => {
    switch (status) {
      case '0':
      case 'pending':
      case 'placed':
        return {
          title: 'Order Received & Pending Approval',
          desc: 'Your herbal order has been received by our Surat apothecary and is being prepared.',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          step: 1,
        };
      case '1':
      case 'accepted':
      case 'confirmed':
        return {
          title: 'Order Accepted',
          desc: 'Your order has been verified and approved for botanical packaging and quality dispatch.',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          step: 2,
        };
      case '2':
      case 'dispatched':
      case 'shipped':
      case 'processing':
        return {
          title: 'Order Dispatched',
          desc: 'Your herbal order has been packaged and dispatched from our Surat workshop.',
          color: 'text-purple-700 bg-purple-50 border-purple-200',
          step: 3,
        };
      case 'in_transit':
      case 'transit':
        return {
          title: 'In Transit',
          desc: 'Your shipment is in transit and on its way to your delivery location.',
          color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
          step: 4,
        };
      case 'delivered':
        return {
          title: 'Order Delivered',
          desc: 'Your package was successfully delivered. Enjoy your pure Ayurvedic wellness formulations!',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          step: 5,
        };
      case '3':
      case 'returned_by_customer':
        return {
          title: 'Return Initiated by Customer',
          desc: 'A return request is being processed for this order.',
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          step: 0,
        };
      case '4':
      case 'cancelled_by_seller':
      case 'cancelled':
        return {
          title: 'Order Cancelled',
          desc: 'This order was cancelled. For queries, contact support@labdhiherbs.com.',
          color: 'text-red-700 bg-red-50 border-red-200',
          step: 0,
        };
      case '5':
      case 'return_received':
        return {
          title: 'Return Received',
          desc: 'The returned shipment has been received at our Surat warehouse.',
          color: 'text-teal-700 bg-teal-50 border-teal-200',
          step: 0,
        };
      default:
        return {
          title: 'Order Processing',
          desc: 'Your order status is currently being updated.',
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          step: 1,
        };
    }
  };

  const statusInfo = getStatusText(orderData?.orderStatus);

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-slate-800 flex flex-col font-sans">
      <Header
        cartCount={cartCount}
        onOpenCart={openCart}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
      <CartDrawer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => {
          setIsSearchOpen(false);
          router.push(`/product/${p.id}`);
        }}
      />

      {/* Invoice Modal for Customer */}
      {showInvoice && (
        <AdminInvoiceModal order={orderData} onClose={() => setShowInvoice(false)} />
      )}

      {/* Track Order Hero Banner (Clean Ayurvedic Deep Green Matching Policy Pages) */}
      <section className="relative pt-32 pb-14 md:pt-40 md:pb-16 bg-[#14261E] text-white overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10 px-4 flex flex-col items-center">
          
          {/* Breadcrumb Navigation */}
          <nav className="inline-flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
            <span className="text-[#D4A373] font-semibold">Track Order</span>
          </nav>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            Track Your Ayurvedic Order
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/75 font-light max-w-xl mx-auto leading-relaxed">
            Enter your Order ID (found in your order confirmation SMS or email) to check live status, tracking information, and download your official invoice.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto pt-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTrack();
              }}
              className="flex items-center bg-white rounded-2xl p-1.5 shadow-xl border border-white/20"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                  placeholder="e.g. 1317 or LH-2026-94821"
                  className="w-full pl-10 pr-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isSearching ? (
                  <span>Searching...</span>
                ) : (
                  <>
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 space-y-6">
        
        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium shadow-xs">
            {errorMessage}
          </div>
        )}

        {/* Order Details Result */}
        <AnimatePresence>
          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-6"
            >
              {/* Order Status Banner */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 shadow-sm space-y-5 text-center">
                <div className="inline-block">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${statusInfo.color}`}>
                    {statusInfo.title}
                  </span>
                </div>

                <p className="text-xs text-slate-600 max-w-lg mx-auto font-light leading-relaxed">
                  {statusInfo.desc}
                </p>

                {/* Progress Step Line (if active order) */}
                {statusInfo.step > 0 && (
                  <div className="pt-2 max-w-md mx-auto">
                    <div className="flex items-center justify-between relative">
                      {/* Connecting line */}
                      <div className="absolute left-4 right-4 top-3 h-0.5 bg-slate-200 -z-0" />
                      <div
                        className="absolute left-4 top-3 h-0.5 bg-[#1F3A2E] -z-0 transition-all duration-500"
                        style={{ width: `${((statusInfo.step - 1) / 4) * 100}%` }}
                      />

                      {[
                        { step: 1, label: 'Received' },
                        { step: 2, label: 'Accepted' },
                        { step: 3, label: 'Dispatched' },
                        { step: 4, label: 'In Transit' },
                        { step: 5, label: 'Delivered' },
                      ].map((s) => (
                        <div key={s.step} className="flex flex-col items-center gap-1.5 z-10">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                              statusInfo.step >= s.step
                                ? 'bg-[#1F3A2E] text-white'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            {statusInfo.step >= s.step ? '✓' : s.step}
                          </div>
                          <span className={`text-[10px] ${statusInfo.step >= s.step ? 'font-bold text-slate-800' : 'text-slate-400 font-light'}`}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking & Courier Details Box */}
                {(orderData.deliveryName || orderData.deliveryTrackId) && (
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] flex flex-wrap items-center justify-between gap-4 text-left max-w-lg mx-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Delivery Partner
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {orderData.deliveryName || 'Standard Express'}
                      </span>
                    </div>

                    {orderData.deliveryTrackId && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Tracking / AWB No.
                        </span>
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {orderData.deliveryTrackId}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Address & Order Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Delivery Address */}
                <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs space-y-2">
                  <h4 className="text-[11px] font-bold text-[#1F3A2E] uppercase tracking-wider border-b border-[#EFE9DD] pb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>Delivery Address</span>
                  </h4>
                  <div className="space-y-1 text-slate-700">
                    <p className="font-bold text-slate-900">{orderData.customer?.fullName || orderData.shippingAddress?.fullName}</p>
                    <p className="text-slate-500 font-mono">{orderData.customer?.phone || orderData.shippingAddress?.phone}</p>
                    <p className="text-slate-600 font-light leading-relaxed">
                      {orderData.shippingAddress?.address}
                      {orderData.shippingAddress?.landmark && `, ${orderData.shippingAddress.landmark}`}
                      <br />
                      {orderData.shippingAddress?.city}, {orderData.shippingAddress?.state} - {orderData.shippingAddress?.pincode}
                    </p>
                  </div>
                </div>

                {/* Order Information & Payment */}
                <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs space-y-2">
                  <h4 className="text-[11px] font-bold text-[#1F3A2E] uppercase tracking-wider border-b border-[#EFE9DD] pb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>Order Information</span>
                  </h4>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Order ID:</span>
                      <span className="font-mono font-bold text-slate-800">#{orderData.orderId}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Ordered on:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(orderData.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Status:</span>
                      <span className="font-bold text-emerald-700">
                        {orderData.payment?.status === 'completed'
                          ? 'Paid Online'
                          : orderData.payment?.method === 'cod'
                          ? 'Cash on Delivery (Pending)'
                          : 'Pending'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#EFE9DD]/60">
                      <button
                        onClick={() => setShowInvoice(true)}
                        className="w-full py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>View &amp; Print Official Invoice</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Items Table */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 sm:p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-[#1F3A2E] uppercase tracking-wider border-b border-[#EFE9DD] pb-2">
                  Purchased Items ({orderData.items?.length || 0})
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EFE9DD] text-slate-400 uppercase text-[10px] font-bold">
                        <th className="pb-2 w-12 text-center">#</th>
                        <th className="pb-2">Product</th>
                        <th className="pb-2 text-center w-16">Quantity</th>
                        <th className="pb-2 text-right w-24">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9DD]">
                      {orderData.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3 text-center text-slate-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product?.image}
                                alt={item.product?.name}
                                className="w-12 h-12 rounded-xl object-cover border border-[#EFE9DD] bg-slate-50"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <p className="font-bold text-slate-800 text-xs">
                                  {item.product?.name}
                                </p>
                                {item.product?.category && (
                                  <span className="text-[10px] text-[#B58A5A] font-semibold">
                                    {item.product.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center font-semibold text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="py-3 text-right font-bold text-[#1F3A2E]">
                            ₹{item.total || item.price * item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#EFE9DD] flex justify-end">
                  <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span className="font-bold text-slate-800">₹{orderData.pricing?.subtotal || 0}</span>
                    </div>

                    {orderData.pricing?.discount ? (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Discount {orderData.couponCode && `(${orderData.couponCode})`}:</span>
                        <span>− ₹{orderData.pricing.discount}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-medium text-slate-800">
                        {orderData.pricing?.shipping ? `₹${orderData.pricing.shipping}` : 'Free'}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-sm text-[#1F3A2E] pt-2 border-t border-[#EFE9DD]">
                      <span>TOTAL PAID:</span>
                      <span>₹{orderData.pricing?.total || 0}</span>
                    </div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <Footer />
    </div>
  );
}
