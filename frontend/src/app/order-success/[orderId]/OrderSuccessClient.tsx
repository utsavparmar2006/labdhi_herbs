'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrderById } from '../../../services/api';
import { Order } from '../../../types';
import OriginalTransparentLogo from '../../../components/OriginalTransparentLogo';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Banknote,
  Printer,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderSuccessClientProps {
  orderId: string;
}

export default function OrderSuccessClient({ orderId }: OrderSuccessClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await getOrderById(orderId);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError(res.message || 'Unable to locate order details');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading order');
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  // Estimated delivery calculation (3-5 business days from order creation)
  const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();
  const deliveryStart = new Date(orderDate);
  deliveryStart.setDate(deliveryStart.getDate() + 3);
  const deliveryEnd = new Date(orderDate);
  deliveryEnd.setDate(deliveryEnd.getDate() + 5);

  const formattedDateRange = `${deliveryStart.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  })} – ${deliveryEnd.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm font-bold text-[#1A201C]">
            Retrieving Your Herbal Order Confirmation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] font-sans selection:bg-[#1F3A2E] selection:text-[#EFE9DD]">
      
      {/* Header */}
      <header className="border-b border-[#EFE9DD] bg-white py-4 px-6 print:hidden">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-block">
            <OriginalTransparentLogo className="h-9 sm:h-11 w-auto" />
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Order Confirmation</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        
        {/* Celebratory Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 bg-white rounded-3xl border border-[#EFE9DD] p-8 sm:p-12 shadow-xs"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B58A5A] bg-[#F8F6F0] px-3 py-1 rounded-full border border-[#EFE9DD]">
              Order Successfully Placed
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A201C]">
              Thank You for Trusting Labdhi Herbs!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-light max-w-lg mx-auto leading-relaxed">
              Your Ayurvedic formulation order{' '}
              <strong className="font-bold text-[#1F3A2E]">{order?.orderId || orderId}</strong> has
              been confirmed. We are carefully preparing your botanical remedy for dispatch from our
              Surat facility.
            </p>
          </div>

          {order?.customer?.email && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F8F6F0] text-xs text-slate-600 border border-[#EFE9DD]">
              <Mail className="w-3.5 h-3.5 text-[#B58A5A]" />
              <span>
                Order invoice and tracking details sent to: <strong>{order.customer.email}</strong>
              </span>
            </div>
          )}
        </motion.div>

        {/* Visual Order Fulfillment Timeline */}
        <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-3">
            <h3 className="font-serif text-sm font-bold text-[#1A201C] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D4A373]" />
              <span>Estimated Delivery Timeline</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {formattedDateRange}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. Order Placed</span>
              </span>
              <p className="text-[11px] text-emerald-700 font-light">Order received & verified</p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-[#1F3A2E] text-white space-y-1 text-xs shadow-xs">
              <span className="font-bold text-[#D4A373] flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                <span>2. Quality Check</span>
              </span>
              <p className="text-[11px] text-emerald-100/70 font-light">Batch testing & packing</p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-1 text-xs text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>3. Dispatched</span>
              </span>
              <p className="text-[11px] font-light">Dispatched from Surat hub</p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-1 text-xs text-slate-500">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>4. Doorstep Delivery</span>
              </span>
              <p className="text-[11px] font-light">Delivered to your address</p>
            </div>
          </div>
        </div>

        {/* Two-Column Order Receipt Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Delivery Address & Customer Contact */}
          <div className="md:col-span-5 bg-white rounded-3xl border border-[#EFE9DD] p-6 shadow-xs space-y-5">
            <h3 className="font-serif text-sm font-bold text-[#1A201C] border-b border-[#EFE9DD] pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#B58A5A]" />
              <span>Delivery Details</span>
            </h3>

            {order?.shippingAddress && (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recipient Name
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {order.shippingAddress.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <span className="font-semibold text-slate-700">
                    +91 {order.shippingAddress.phone}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Shipping Address
                  </span>
                  <p className="text-slate-600 font-light leading-relaxed mt-0.5">
                    {order.shippingAddress.address}
                    {order.shippingAddress.landmark && `, Near ${order.shippingAddress.landmark}`}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} —{' '}
                    <strong>{order.shippingAddress.pincode}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Payment Mode
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] font-semibold text-slate-800">
                    {order.payment?.method === 'cod' ? (
                      <>
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Cash on Delivery (Pay at Doorstep)</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span>Instant Online Payment (Completed)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Purchased Items & Price Summary */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-[#EFE9DD] p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-3">
              <h3 className="font-serif text-sm font-bold text-[#1A201C] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#D4A373]" />
                <span>Formulations Ordered</span>
              </h3>
              <span className="text-xs text-slate-400 font-light">
                {order?.items?.length || 0} items
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {order?.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="w-12 h-12 rounded-xl object-cover bg-white border border-[#EFE9DD] shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-slate-800 truncate">
                        {item.product?.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-light">
                        Qty: {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <span className="font-bold text-[#1F3A2E] shrink-0">₹{item.total}</span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-[#EFE9DD] space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">₹{order?.pricing?.subtotal || 0}</span>
              </div>

              {order?.pricing?.discount ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Savings ({order.couponCode || 'PROMO'}):</span>
                  <span>−₹{order.pricing.discount}</span>
                </div>
              ) : null}

              <div className="flex justify-between text-slate-600">
                <span>Express All-India Shipping:</span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-serif text-sm font-bold text-[#1A201C]">Total Amount:</span>
                <span className="font-serif text-2xl font-bold text-[#1F3A2E]">
                  ₹{order?.pricing?.total || 0}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Actions & Support Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#EFE9DD] bg-white hover:bg-[#F8F6F0] text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Invoice Receipt</span>
            </button>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4 text-[#D4A373]" />
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-[#B58A5A]" />
            <span>Need help with this order? Call +91 93283 49328</span>
          </div>
        </div>

      </main>

    </div>
  );
}
