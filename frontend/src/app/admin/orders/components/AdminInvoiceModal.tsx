'use client';

import React, { useState } from 'react';
import { Order } from '../../../../types';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Package,
  Truck,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useSiteSettings } from '../../../../context/SiteSettingsContext';

interface AdminInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  isOpen?: boolean;
}

export default function AdminInvoiceModal({ order, onClose, isOpen }: AdminInvoiceModalProps) {
  const { settings } = useSiteSettings();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (isOpen === false || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const invoiceElement = document.getElementById('printable-invoice');
    if (!invoiceElement || isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const html2canvasModule = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvasModule(invoiceElement, {
        scale: 2, // 2x high resolution for ultra-sharp typography
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${order.orderId || 'Labdhi-Herbs'}.pdf`);
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      // Clean fallback: open browser print-to-pdf dialog
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const subtotal = order.pricing?.subtotal || 0;
  const discount = order.pricing?.discount || 0;
  const shipping = order.pricing?.shipping || 0;
  const total = order.pricing?.total || Math.max(0, subtotal - discount + shipping);

  const customerState = (order.shippingAddress?.state || '').trim().toLowerCase();
  const isGujarat = customerState.includes('gujarat') || customerState === 'gj' || customerState === '';

  // GST rates from settings or defaults
  const cgstRate = settings?.cgst ?? 9;
  const sgstRate = settings?.sgst ?? 9;
  const igstRate = settings?.igst ?? 18;
  const effectiveGstRate = isGujarat ? Number(cgstRate) + Number(sgstRate) : Number(igstRate);

  // Backward inclusive GST calculation
  let tax = order.pricing?.tax ?? 0;
  let sgst = order.pricing?.sgst ?? 0;
  let cgst = order.pricing?.cgst ?? 0;
  let igst = order.pricing?.igst ?? 0;
  let taxableAmount = order.pricing?.taxableAmount;

  if ((taxableAmount === undefined || taxableAmount === 0) && total > 0) {
    taxableAmount = Math.round((total / (1 + effectiveGstRate / 100)) * 100) / 100;
    tax = Math.round((total - taxableAmount) * 100) / 100;
    if (isGujarat) {
      cgst = Math.round((tax / 2) * 100) / 100;
      sgst = Math.round((tax - cgst) * 100) / 100;
      igst = 0;
    } else {
      igst = tax;
      cgst = 0;
      sgst = 0;
    }
  } else if (taxableAmount === undefined) {
    taxableAmount = 0;
  }

  // Seller Address - cleanly remove Adajan as requested
  const rawAddress =
    settings?.profile?.address ||
    settings?.address ||
    '40, Jay Ambe Society, Makkai Pool Rd, Surat, Gujarat 395009, India';
  const cleanSellerAddress = rawAddress.replace(/adajan,?\s*/gi, '').trim();

  const sellerPhone = settings?.supportPhone || settings?.profile?.adminPhone || '+91 93283 49328';
  const sellerEmail = settings?.supportEmail || settings?.profile?.adminEmail || 'support@labdhiherbs.com';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm p-3 sm:p-6 md:p-8 flex justify-center items-start print:p-0 print:bg-white print:static print:overflow-visible transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Dialog Card */}
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-4 sm:my-8 overflow-hidden border border-[#EFE9DD] print:border-none print:shadow-none print:rounded-none print:max-w-none print:my-0 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Action Header (Always visible at top while scrolling, hidden during print) */}
        <div className="sticky top-0 z-30 px-5 sm:px-8 py-3.5 sm:py-4 border-b border-[#EFE9DD] bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#1F3A2E] text-[#D4A373]">
              Tax Invoice
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-slate-800">
              #{order.orderId}
            </span>
            <span
              className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                order.payment?.status === 'completed'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : order.payment?.method === 'cod'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {order.payment?.status === 'completed'
                ? '✓ Paid Online'
                : order.payment?.method === 'cod'
                ? 'Cash on Delivery'
                : 'Pending'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all cursor-pointer"
              title="Download Invoice as PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-[#B58A5A]" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Downloadable Invoice Sheet */}
        <div
          id="printable-invoice"
          className="p-6 sm:p-10 space-y-7 bg-white text-slate-800 text-xs leading-normal"
        >
          {/* Header Section: Company Logo, Brand & Invoice Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#EFE9DD] pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] flex items-center justify-center p-1.5 overflow-hidden shadow-2xs">
                <img
                  src="/logo-transparent.png"
                  alt="Labdhi Herbs Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to text initials if image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div>
                <h1 className="font-serif text-2xl font-bold text-[#1F3A2E] tracking-tight">
                  Labdhi Herbs
                </h1>
                <p className="text-[11px] text-[#B58A5A] font-semibold tracking-wide uppercase">
                  Pure Ayurvedic &amp; Botanical Formulations
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">{sellerEmail}</p>
                <p className="text-slate-500 text-[11px]">Surat, Gujarat, India</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Official Tax Invoice
              </span>
              <h2 className="font-mono text-xl font-bold text-[#1F3A2E]">
                #{order.orderId}
              </h2>
              <p className="text-slate-500 text-xs">
                Issued Date: <strong className="text-slate-700 font-semibold">{formattedDate}</strong>
              </p>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                Payment: {order.payment?.status === 'completed' ? 'Paid Online' : order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Pending'}
              </div>
            </div>
          </div>

          {/* Billing & Shipping Address Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-[#F8F6F0]/60 p-5 rounded-2xl border border-[#EFE9DD]">
            {/* Billed From (Seller) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Billed From (Seller)
              </span>
              <h4 className="font-bold text-sm text-[#1F3A2E]">Labdhi Herbs</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {cleanSellerAddress}
              </p>
              <p className="text-slate-600 text-[11px]">Phone: {sellerPhone}</p>
              <p className="text-slate-600 text-[11px]">Email: {sellerEmail}</p>
              <p className="text-slate-500 text-[10px] pt-0.5 font-medium">State: Gujarat (State Code: 24)</p>
            </div>

            {/* Shipped & Billed To (Customer) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Shipped &amp; Billed To (Customer)
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {order.customer?.fullName || order.shippingAddress?.fullName || 'Customer'}
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {order.shippingAddress?.address}
                {order.shippingAddress?.landmark && `, ${order.shippingAddress.landmark}`}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-slate-600 text-[11px]">
                Contact: {order.customer?.phone || order.shippingAddress?.phone || 'N/A'}
              </p>
              {order.customer?.email && (
                <p className="text-slate-600 text-[11px]">Email: {order.customer.email}</p>
              )}
            </div>
          </div>

          {/* Courier Fulfillment Card (if available) */}
          {(order.deliveryName || order.deliveryTrackId) && (
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-700" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    Courier Partner
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {order.deliveryName || 'India Post / Speed Post'}
                  </span>
                </div>
              </div>

              {order.deliveryTrackId && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    AWB Number
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {order.deliveryTrackId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Formulations & Items Table */}
          <div className="border border-[#EFE9DD] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1F3A2E] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Item Formulation</th>
                  <th className="py-3 px-4 text-center w-20">Quantity</th>
                  <th className="py-3 px-4 text-right w-24">Rate (MRP)</th>
                  <th className="py-3 px-4 text-right w-28">Sub-Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-xs">
                          {item.product?.name || 'Ayurvedic Product'}
                        </p>
                        {item.product?.category && (
                          <span className="text-[10px] text-[#B58A5A] font-semibold">
                            {item.product.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700 font-mono">
                      ₹{item.price}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ₹{item.total || item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Summary & Tax Calculation Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-1">
            {/* Payment & Terms Note */}
            <div className="sm:max-w-xs text-[11px] text-slate-500 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Payment &amp; Quality Guarantee:</span>
              </div>
              <p className="leading-relaxed">
                Authentic 100% natural Ayurvedic formulations manufactured in Surat, Gujarat.
              </p>
              <p className="text-[10px] text-slate-400">
                For questions, assistance, or returns, write to{' '}
                <strong className="text-slate-600">{sellerEmail}</strong>.
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 py-1 border-b border-[#EFE9DD]">
                <span>Gross Total (MRP):</span>
                <span className="font-semibold text-slate-800 font-mono">₹{subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 py-1 border-b border-[#EFE9DD] font-semibold">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}:</span>
                  <span className="font-mono">- ₹{discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 py-1 border-b border-[#EFE9DD]">
                <span>Delivery / Shipping:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 py-1 border-b border-[#EFE9DD]">
                <span>Taxable Value (Before Tax):</span>
                <span className="font-medium text-slate-700 font-mono">₹{taxableAmount.toFixed(2)}</span>
              </div>

              {sgst > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px] py-0.5">
                  <span>SGST ({sgstRate}%):</span>
                  <span className="font-mono">₹{sgst.toFixed(2)}</span>
                </div>
              )}

              {cgst > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px] py-0.5">
                  <span>CGST ({cgstRate}%):</span>
                  <span className="font-mono">₹{cgst.toFixed(2)}</span>
                </div>
              )}

              {igst > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px] py-0.5">
                  <span>IGST ({igstRate}%):</span>
                  <span className="font-mono">₹{igst.toFixed(2)}</span>
                </div>
              )}

              {tax > 0 && (
                <div className="flex justify-between text-slate-400 text-[10px] pb-1 border-b border-[#EFE9DD] italic">
                  <span>(Total Inclusive GST):</span>
                  <span className="font-mono">₹{tax.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-base text-[#1F3A2E] pt-2 border-t-2 border-[#1F3A2E]">
                <span>Total Amount:</span>
                <span className="text-lg font-mono font-bold text-[#1F3A2E]">₹{total.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-right text-emerald-700 font-medium">
                (Inclusive of all applicable GST)
              </p>
            </div>
          </div>

          {/* Footer Computer-Generated Note */}
          <div className="border-t border-[#EFE9DD] pt-5 text-center text-slate-400 text-[10px] space-y-1">
            <p className="font-bold text-slate-600">Thank you for choosing Labdhi Herbs!</p>
            <p>This is an official computer-generated tax invoice and requires no physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
