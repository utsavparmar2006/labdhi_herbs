'use client';

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { createOrder, getCoupons, validateCoupon as apiValidateCoupon } from '../../services/api';
import OriginalTransparentLogo from '../../components/OriginalTransparentLogo';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShoppingBag,
  Tag,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  X,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Chandigarh',
];

const AVAILABLE_COUPONS = [
  { code: 'HERBAL10', desc: '10% OFF on entire order', type: 'percent', value: 10, min: 0 },
  { code: 'WELCOME50', desc: '₹50 FLAT OFF on orders above ₹299', type: 'flat', value: 50, min: 299 },
  { code: 'AYURVEDA15', desc: '15% OFF on orders above ₹499', type: 'percent', value: 15, min: 499 },
];

export default function CheckoutClient() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [onlineType, setOnlineType] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // Dynamic Coupons State
  const [availableCoupons, setAvailableCoupons] = useState<Array<{ code: string; desc: string; type: string; value: number; min: number }>>(AVAILABLE_COUPONS);

  useEffect(() => {
    let isMounted = true;
    const loadDynamicCoupons = async () => {
      try {
        const res = await getCoupons({ showOnlyPublic: true });
        if (res.success && Array.isArray(res.data) && res.data.length > 0 && isMounted) {
          const formatted = res.data.map((c) => ({
            code: c.code,
            desc:
              c.type === 'percentage'
                ? `${c.value}% OFF on entire order`
                : c.type === 'fixed_amount'
                ? `₹${c.value} FLAT OFF`
                : 'Free Express Delivery',
            type: c.type === 'percentage' ? 'percent' : 'flat',
            value: c.value,
            min: c.minimumRequirement === 'amount' ? c.minAmount : 0,
          }));
          setAvailableCoupons(formatted);
        }
      } catch (err) {
        // Fallback to static initial promotions
      }
    };
    loadDynamicCoupons();
    return () => {
      isMounted = false;
    };
  }, []);

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description: string;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculations
  const subtotal = totalAmount;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shipping = 0; // Free express delivery across India
  const finalTotal = Math.max(0, subtotal - discount + shipping);

  // Form Input Change Handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Coupon Validation & Apply
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    setCouponError('');

    if (!code) {
      setCouponError('Please enter a promo code');
      return;
    }

    try {
      const res = await apiValidateCoupon({
        code,
        subtotal,
        itemsCount: items.length,
        paymentMethod,
      });

      if (res.success && res.data) {
        setAppliedCoupon({
          code: res.data.code,
          discountAmount: res.data.discountAmount,
          description: res.data.description,
        });
        setCouponInput('');
        return;
      } else if (res.message) {
        setCouponError(res.message);
        return;
      }
    } catch (apiErr) {
      console.warn('API coupon validation fallback:', apiErr);
    }

    // Fallback to local coupons if server endpoint uncontactable
    const coupon = availableCoupons.find((c) => c.code === code);
    if (!coupon) {
      setCouponError('Invalid promo code. Try HERBAL10 for 10% off.');
      return;
    }

    if (subtotal < coupon.min) {
      setCouponError(`This code requires a minimum order of ₹${coupon.min}`);
      return;
    }

    let calculatedDiscount = 0;
    if (coupon.type === 'percent') {
      calculatedDiscount = Math.round((subtotal * coupon.value) / 100);
    } else {
      calculatedDiscount = Math.min(coupon.value, subtotal);
    }

    setAppliedCoupon({
      code: coupon.code,
      discountAmount: calculatedDiscount,
      description: coupon.desc,
    });
    setCouponInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Form Submit & Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your full recipient name');
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address for order notifications');
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage('Please enter your complete delivery street address');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage('Please enter your city');
      return;
    }

    const cleanPincode = formData.pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit postal PIN code');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your shopping cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: cleanPhone,
        },
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: cleanPhone,
          address: formData.address.trim(),
          landmark: formData.landmark.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: cleanPincode,
        },
        items: items.map((i) => ({
          product: {
            id: i.product.id,
            name: i.product.name,
            price: Number(i.product.price || 0),
            image: i.product.image,
            category: i.product.category,
          },
          quantity: i.quantity,
        })),
        paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        notes: formData.notes.trim(),
      };

      const res = await createOrder(payload);

      if (res.success && res.data?.orderId) {
        clearCart();
        router.push(`/order-success/${res.data.orderId}`);
      } else {
        setErrorMessage(res.message || 'Failed to place order. Please check your details.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // If cart is empty and user visits checkout directly
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] flex flex-col justify-between">
        <header className="border-b border-[#EFE9DD] bg-white py-4 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="inline-block">
              <OriginalTransparentLogo className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-[#1F3A2E]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
              Your Shopping Bag is Empty
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
              Explore our handcrafted Ayurvedic formulations and add pure herbal wellness to your bag.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <span>Explore Formulations</span>
            <ArrowRight className="w-4 h-4 text-[#D4A373]" />
          </Link>
        </main>

        <footer className="border-t border-[#EFE9DD] bg-white py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Labdhi Herbs. All rights reserved. Handcrafted in Surat, Gujarat.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] font-sans selection:bg-[#1F3A2E] selection:text-[#EFE9DD]">
      
      {/* Distraction-Free Professional Checkout Header */}
      <header className="sticky top-0 z-30 border-b border-[#EFE9DD] bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <OriginalTransparentLogo className="h-9 sm:h-11 w-auto" />
          </Link>

          {/* Trust Guarantees */}
          <div className="hidden sm:flex items-center gap-6 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Authentic Ayurveda</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Bank-Grade 256-Bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-[#B58A5A]" />
              <span>Support: +91 93283 49328</span>
            </div>
          </div>

          <Link
            href="/shop"
            className="text-xs font-bold text-[#1F3A2E] hover:underline flex items-center gap-1"
          >
            <span>Continue Shopping</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Progress Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Link href="/shop" className="hover:text-[#1F3A2E]">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="font-semibold text-[#1F3A2E]">Secure Checkout</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-400">Confirmation</span>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="flex-1 font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage('')}
              className="text-red-400 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Multi-Step Delivery & Payment Form */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Customer Contact & Delivery Address */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center font-serif text-xs font-bold">
                      1
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#1A201C]">
                      Contact Information & Delivery Address
                    </h2>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Dispatched from Surat
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span>Recipient Full Name</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Mobile Number</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3.5 text-xs text-slate-400 font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">Used for courier delivery updates & OTP</p>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Email Address</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="priya@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                    <p className="text-[10px] text-slate-400">Order invoice & tracking link sent here</p>
                  </div>

                  {/* Street Address */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Complete Street Address (Flat / House No., Building, Area)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g. 402, Shivam Residency, Near Parle Point, Athwa Lines"
                      className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  {/* Landmark */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nearby Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      placeholder="e.g. Opposite Iscon Temple or Behind Central Bank"
                      className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  {/* Postal Pincode */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span>Postal PIN Code</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="pincode"
                        required
                        maxLength={6}
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="e.g. 395007"
                        className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                      {formData.pincode.length === 6 && (
                        <span className="absolute right-3 top-3 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          ✓ Delivery Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>City / Town</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Surat"
                      className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  {/* State */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span>State</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#EFE9DD] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Method */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-3 border-b border-[#EFE9DD] pb-4">
                  <span className="w-7 h-7 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center font-serif text-xs font-bold">
                    2
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#1A201C]">
                    Shipping & Delivery Method
                  </h2>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F6F0] border-2 border-[#1F3A2E] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center shrink-0 shadow-xs">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#1A201C]">
                          Standard Express Herbal Courier
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          FREE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-light mt-0.5">
                        Estimated delivery in 3 to 5 business days across all Indian pincodes.
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-emerald-700">₹0 (Free)</span>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center font-serif text-xs font-bold">
                      3
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#1A201C]">
                      Select Payment Method
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Zero Convenience Fee</span>
                </div>

                <div className="space-y-3">
                  {/* Cash on Delivery (COD) Option */}
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#1F3A2E] bg-emerald-50/40 shadow-xs'
                        : 'border-[#EFE9DD] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 w-4 h-4 text-[#1F3A2E] focus:ring-[#1F3A2E] cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#1A201C] flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-emerald-700" />
                          <span>Cash on Delivery (COD)</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">
                        Pay in cash or via UPI QR code directly to the courier executive upon doorstep delivery.
                      </p>
                    </div>
                  </label>

                  {/* Online Payment (UPI, Cards, Netbanking) Option */}
                  <label
                    onClick={() => setPaymentMethod('online')}
                    className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'online'
                        ? 'border-[#1F3A2E] bg-emerald-50/40 shadow-xs'
                        : 'border-[#EFE9DD] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="mt-1 w-4 h-4 text-[#1F3A2E] focus:ring-[#1F3A2E] cursor-pointer"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-[#1A201C] flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-[#B58A5A]" />
                          <span>Instant Online Payment (UPI / QR / Cards / NetBanking)</span>
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Instant Order Confirmation
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-light leading-relaxed">
                        Pay securely with Google Pay, PhonePe, Paytm, RuPay, Visa, Mastercard, or NetBanking.
                      </p>

                      {paymentMethod === 'online' && (
                        <div className="pt-3 space-y-3">
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOnlineType('upi');
                              }}
                              className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                                onlineType === 'upi'
                                  ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white shadow-xs'
                                  : 'border-[#EFE9DD] bg-white text-slate-600'
                              }`}
                            >
                              UPI / QR
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOnlineType('card');
                              }}
                              className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                                onlineType === 'card'
                                  ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white shadow-xs'
                                  : 'border-[#EFE9DD] bg-white text-slate-600'
                              }`}
                            >
                              Cards
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOnlineType('netbanking');
                              }}
                              className={`py-2 px-3 rounded-xl border text-center font-semibold transition-all ${
                                onlineType === 'netbanking'
                                  ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white shadow-xs'
                                  : 'border-[#EFE9DD] bg-white text-slate-600'
                              }`}
                            >
                              NetBanking
                            </button>
                          </div>

                          <div className="p-3.5 rounded-xl bg-white border border-[#EFE9DD] text-xs text-slate-600 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Instant UPI Verification Enabled</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-light">
                              Upon clicking &quot;Place Order&quot;, your payment is processed with 100% encryption and instant confirmation.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Delivery Notes */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-700">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Please leave package with security guard if unavailable"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Sticky Order Summary & Price Breakdown */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
              
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-7 shadow-xs space-y-6">
                
                <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
                  <h3 className="font-serif text-base font-bold text-[#1A201C] flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D4A373]" />
                    <span>Order Summary</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-light">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Items Mini List */}
                <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id} className="flex items-center gap-3.5 text-xs">
                      <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-[#EFE9DD]">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                          }}
                        />
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[9px] font-bold flex items-center justify-center">
                          {quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-[#1A201C] truncate">
                          {product.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {product.category}
                        </span>
                      </div>

                      <span className="font-bold text-[#1F3A2E] shrink-0">
                        ₹{Number(product.price || 0) * quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promotional Coupon Card */}
                <div className="pt-4 border-t border-[#EFE9DD] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Promotional Discount Code</span>
                    </label>
                  </div>

                  {appliedCoupon ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Coupon &quot;{appliedCoupon.code}&quot; Applied!</span>
                        </div>
                        <p className="text-[11px] text-emerald-700 font-light">
                          You saved ₹{appliedCoupon.discountAmount} on this order
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-emerald-700 hover:text-red-600 font-bold text-xs p-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="e.g. HERBAL10"
                          className="flex-1 px-3.5 py-2 rounded-xl border border-[#EFE9DD] text-xs font-semibold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                      )}

                      {/* Quick Apply Badge Suggestion */}
                      {availableCoupons.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
                          <Sparkles className="w-3 h-3 text-[#B58A5A]" />
                          <span>Available:</span>
                          {availableCoupons.slice(0, 3).map((cp) => (
                            <button
                              key={cp.code}
                              type="button"
                              onClick={() => handleApplyCoupon(cp.code)}
                              className="font-bold text-[#1F3A2E] underline hover:text-[#B58A5A] cursor-pointer mr-1"
                            >
                              {cp.code} ({cp.type === 'percent' ? `${cp.value}% Off` : `₹${cp.value} Flat`})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-[#EFE9DD] space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-bold text-slate-800">₹{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Promo Coupon Discount:</span>
                      <span>−₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Express All-India Delivery:</span>
                    <span className="text-emerald-700 font-bold">FREE</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>GST & Packaging:</span>
                    <span className="text-slate-400">Included</span>
                  </div>

                  <div className="pt-3 border-t border-[#EFE9DD] flex justify-between items-baseline">
                    <div>
                      <span className="font-serif text-sm font-bold text-[#1A201C] block">
                        Total Payable:
                      </span>
                      <span className="text-[10px] text-slate-400 font-light">
                        Inclusive of all government taxes
                      </span>
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#1F3A2E]">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Processing Secure Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#D4A373]" />
                      <span>
                        Place Order — {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Instant Online'}
                      </span>
                    </>
                  )}
                </button>

                {/* Security Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-[10px] text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Safe & Tested Ayurveda</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#1F3A2E]" />
                    <span>Express Surat Dispatch</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </form>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#EFE9DD] bg-white py-6 mt-12 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Labdhi Herbs. All rights reserved. Handcrafted in Surat, Gujarat.
      </footer>

    </div>
  );
}
