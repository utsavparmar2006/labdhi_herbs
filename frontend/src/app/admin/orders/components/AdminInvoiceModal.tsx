'use client';

import React from 'react';
import { Order } from '../../../../types';
import { Printer, X, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

interface AdminInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
  isOpen?: boolean;
}

export default function AdminInvoiceModal({ order, onClose, isOpen }: AdminInvoiceModalProps) {
  if (isOpen === false || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const subtotal = order.pricing?.subtotal || 0;
  const discount = order.pricing?.discount || 0;
  const shipping = order.pricing?.shipping || 0;
  const tax = order.pricing?.tax || 0;
  const sgst = order.pricing?.sgst ?? Math.round((tax / 2) * 100) / 100;
  const cgst = order.pricing?.cgst ?? Math.round((tax / 2) * 100) / 100;
  const total = order.pricing?.total || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      {/* Container card */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-[#EFE9DD] print:border-none print:shadow-none print:rounded-none print:max-w-none">
        
        {/* Top bar (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] bg-[#1F3A2E]/10 px-2.5 py-1 rounded-full">
              Official Tax Invoice
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">#{order.orderId}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#D4A373]" />
              <span>Print Invoice</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-6 sm:p-10 space-y-8 bg-white text-slate-800 text-xs">
          
          {/* Header section with Company logo and Invoice info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#EFE9DD] pb-6">
            <div className="flex items-center gap-4">
              <img
                src="/uploads/logo/Main-logo-531.jpg"
                alt="Labdhi Herbs"
                className="w-16 h-16 rounded-2xl object-cover border border-[#EFE9DD] shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="font-serif text-2xl font-bold text-[#1F3A2E] tracking-tight">
                  Labdhi Herbs
                </h1>
                <p className="text-[11px] text-[#B58A5A] font-semibold tracking-wide uppercase">
                  Pure Ayurvedic &amp; Botanical Formulations
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">support@labdhiherbs.com</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Tax Invoice
              </span>
              <h2 className="font-mono text-xl font-bold text-[#1F3A2E]">#{order.orderId}</h2>
              <p className="text-slate-500">Issued Date: <strong className="text-slate-700">{formattedDate}</strong></p>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200">
                Payment: {order.payment?.status === 'completed' ? 'Paid Online' : order.payment?.method === 'cod' ? 'Cash on Delivery' : 'Pending'}
              </div>
            </div>
          </div>

          {/* From / To Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F8F6F0]/50 p-5 rounded-2xl border border-[#EFE9DD]">
            {/* Seller / From */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Billed From (Seller)
              </span>
              <h4 className="font-bold text-sm text-[#1F3A2E]">Labdhi Herbs</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                40, Jay Ambe Society, Makkai Pool Rd,<br />
                Adajan, Surat, Gujarat 395009, India
              </p>
              <p className="text-slate-600 text-[11px]">Phone: +91 93283 49328</p>
              <p className="text-slate-600 text-[11px]">Email: support@labdhiherbs.com</p>
            </div>

            {/* Buyer / To */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Shipped &amp; Billed To (Customer)
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                {order.customer?.fullName || order.shippingAddress?.fullName}
              </h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {order.shippingAddress?.address}
                {order.shippingAddress?.landmark && `, ${order.shippingAddress.landmark}`}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-slate-600 text-[11px]">Contact: {order.customer?.phone || order.shippingAddress?.phone}</p>
              <p className="text-slate-600 text-[11px]">Email: {order.customer?.email}</p>
            </div>
          </div>

          {/* Fulfillment details if available */}
          {(order.deliveryName || order.deliveryTrackId) && (
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Delivery Courier Partner
                </span>
                <span className="font-bold text-slate-800 text-xs">
                  {order.deliveryName || 'Standard Express'}
                </span>
              </div>
              {order.deliveryTrackId && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                    AWB / Tracking Number
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {order.deliveryTrackId}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Items Table */}
          <div className="border border-[#EFE9DD] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1F3A2E] text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Item Description</th>
                  <th className="py-3 px-4 text-center w-20">Quantity</th>
                  <th className="py-3 px-4 text-right w-28">Rate</th>
                  <th className="py-3 px-4 text-right w-28">Sub-total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DD]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {item.product?.image && (
                          <img
                            src={
                              item.product.image.startsWith('http')
                                ? item.product.image
                                : `http://localhost:5000${item.product.image}`
                            }
                            alt={item.product?.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#EFE9DD] bg-slate-50 print:hidden"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-800 text-xs">
                            {item.product?.name || 'Herbal Product'}
                          </p>
                          {item.product?.category && (
                            <span className="text-[10px] text-[#B58A5A] font-semibold">
                              {item.product.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      ₹{item.price}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{item.total || item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
            <div className="sm:max-w-xs text-[11px] text-slate-400 space-y-1">
              <p className="font-bold text-slate-600">Payment &amp; Terms:</p>
              <p>Authentic Ayurvedic formulations manufactured in Surat, Gujarat. For support or returns, write to support@labdhiherbs.com.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 py-1 border-b border-[#EFE9DD]/60">
                <span>Sub Total:</span>
                <span className="font-medium text-slate-800">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 py-1 border-b border-[#EFE9DD]/60 font-semibold">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}:</span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 py-1 border-b border-[#EFE9DD]/60">
                <span>Delivery / Shipping:</span>
                <span className="font-medium text-slate-800">
                  {shipping === 0 ? 'Free' : `₹${shipping}`}
                </span>
              </div>

              {sgst > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px] py-0.5">
                  <span>SGST:</span>
                  <span>₹{sgst}</span>
                </div>
              )}

              {cgst > 0 && (
                <div className="flex justify-between text-slate-500 text-[11px] py-0.5 border-b border-[#EFE9DD]/60">
                  <span>CGST:</span>
                  <span>₹{cgst}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base text-[#1F3A2E] pt-2 border-t-2 border-[#1F3A2E]">
                <span>Total Amount:</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-[#EFE9DD] pt-6 text-center text-slate-400 text-[10px] space-y-1">
            <p className="font-bold text-slate-600">Thank you for choosing Labdhi Herbs!</p>
            <p>This is a computer-generated tax invoice and requires no physical signature.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
