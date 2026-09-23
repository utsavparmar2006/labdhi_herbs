'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import AdminInvoiceModal from './components/AdminInvoiceModal';
import { getAdminOrders, updateOrderStatus } from '../../../services/api';
import { Order, OrderStats, OrderStatusType } from '../../../types';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Printer,
  ChevronDown,
  X,
  Send,
  RotateCcw,
  IndianRupee,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Order Status definitions aligned with older website (0 to 5 + Delivered)
const OLD_STATUS_OPTIONS: { id: string; label: string; badgeColor: string }[] = [
  { id: 'all', label: 'All Statuses', badgeColor: '' },
  { id: 'pending', label: 'Pending for Approval (Order Received)', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'accepted', label: 'Accepted', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'dispatched', label: 'Dispatched', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'in_transit', label: 'In Transit', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'delivered', label: 'Delivered', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'returned_by_customer', label: 'Return by Customer', badgeColor: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'cancelled_by_seller', label: 'Cancel by Seller', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'return_received', label: 'Return Received', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
];

export default function AdminOrdersClient() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  // Editable details inside Order Details modal
  const [editStatus, setEditStatus] = useState<OrderStatusType>('pending');
  const [editDeliveryName, setEditDeliveryName] = useState('');
  const [editDeliveryTrackId, setEditDeliveryTrackId] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');

  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchOrdersList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOrders({
        status: statusFilter,
        search: searchQuery,
      });

      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  // When an order is opened in details modal, populate edit fields
  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus || 'pending');
    setEditDeliveryName(order.deliveryName || '');
    setEditDeliveryTrackId(order.deliveryTrackId || '');
    setEditPaymentStatus(order.payment?.status || 'pending');
  };

  // Save updated status, delivery by, tracking id
  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    setIsSavingDetails(true);

    try {
      const res = await updateOrderStatus(selectedOrder.orderId, {
        status: editStatus,
        deliveryName: editDeliveryName,
        deliveryTrackId: editDeliveryTrackId,
        paymentStatus: editPaymentStatus,
      });

      if (res.success && res.data) {
        showToast('Order details updated successfully');
        const updated = res.data;
        setSelectedOrder(updated);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updated.orderId ? { ...o, ...updated } : o))
        );
        fetchOrdersList();
      } else {
        showToast(res.message || 'Failed to update order');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating order');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '0':
      case 'pending':
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending for Approval</span>
          </span>
        );
      case '1':
      case 'accepted':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Accepted</span>
          </span>
        );
      case '2':
      case 'dispatched':
      case 'shipped':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>Dispatched</span>
          </span>
        );
      case 'in_transit':
      case 'transit':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="w-3 h-3 text-indigo-600" />
            <span>In Transit</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case '3':
      case 'returned_by_customer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <RotateCcw className="w-3 h-3 text-orange-600" />
            <span>Return by Customer</span>
          </span>
        );
      case '4':
      case 'cancelled_by_seller':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Cancel by Seller</span>
          </span>
        );
      case '5':
      case 'return_received':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
            <CheckCircle2 className="w-3 h-3 text-teal-600" />
            <span>Return Received</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-[#1F3A2E] text-white text-xs font-semibold shadow-xl border border-white/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Invoice Modal */}
      <AdminInvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />

      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          title="Order Management"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-2xl font-bold text-[#1F3A2E] block">{stats.totalOrders}</span>
              <span className="text-[10px] text-slate-400">All customer purchases</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                Pending Approval
              </span>
              <span className="text-2xl font-bold text-amber-600 block">{stats.pendingOrders}</span>
              <span className="text-[10px] text-amber-700 font-medium">Needs action</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Delivered Orders
              </span>
              <span className="text-2xl font-bold text-emerald-600 block">{stats.deliveredOrders}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Successfully completed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EFE9DD] shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-bold text-[#B58A5A] block">₹{stats.totalRevenue}</span>
              <span className="text-[10px] text-slate-400">Combined store sales</span>
            </div>
          </div>

          {/* Filter Bar (Matching Older Website Card: Status Select & Search Input) */}
          <div className="bg-white rounded-3xl border border-[#EFE9DD] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              
              {/* Select Status Dropdown */}
              <div className="md:col-span-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Filter by Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-semibold text-slate-700 bg-[#F8F6F0]/60 hover:bg-[#F8F6F0] focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer appearance-none pr-8"
                  >
                    {OLD_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="md:col-span-3 hidden md:block"></div>

              {/* Search Order Input */}
              <div className="md:col-span-5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Search Orders
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, Name, Contact..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table (Columns: #, Order Date, Name, Contact, Status, Action) */}
            <div className="overflow-x-auto border-t border-[#EFE9DD] pt-4">
              {orders.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="font-serif text-sm font-bold text-slate-700">No Orders Found</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto font-light">
                    No orders currently match the selected status filter or search keywords.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#EFE9DD] text-slate-500 uppercase text-[10px] tracking-wider font-bold bg-[#F8F6F0]/80">
                      <th className="py-3 px-3 w-16 text-center">#</th>
                      <th className="py-3 px-3">Order Date</th>
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Total</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DD]">
                    {orders.map((order, idx) => (
                      <tr key={order.orderId} className="hover:bg-[#F8F6F0]/70 transition-colors">
                        {/* # (Order ID) */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-[#1F3A2E]">
                          <button
                            onClick={() => handleOpenOrderDetails(order)}
                            className="hover:underline font-bold text-blue-700"
                            title="View Order Details"
                          >
                            {order.orderId}
                          </button>
                        </td>

                        {/* Order Date */}
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {order.customer?.fullName}
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {order.customer?.phone}
                        </td>

                        {/* Total */}
                        <td className="py-3 px-3 font-bold text-[#1F3A2E]">
                          ₹{order.pricing?.total || 0}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {getStatusBadge(order.orderStatus)}
                        </td>

                        {/* Action Buttons: View Details & Print Invoice */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenOrderDetails(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit / View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>

                            <button
                              onClick={() => setInvoiceOrder(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#1F3A2E]/10 hover:bg-[#1F3A2E]/20 text-[#1F3A2E] text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5 text-[#B58A5A]" />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>

        </main>
      </div>

      {/* Order Details Drawer (Matching Older Website Order Details Cards) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#EFE9DD] flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="p-5 sm:p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#1F3A2E] text-white">
                  <div>
                    <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider block">
                      Order Management
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold">
                      Order Details: #{selectedOrder.orderId}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInvoiceOrder(selectedOrder)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6 text-xs bg-[#FAF9F5]">
                  
                  {/* Two Cards Layout Aligned with Older Website */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Card 1: Order Details */}
                    <div className="bg-white rounded-2xl border border-[#EFE9DD] p-4 shadow-xs space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F3A2E] border-b border-[#EFE9DD] pb-2">
                        Order Details
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Order Id:</span>
                          <span className="font-mono font-bold bg-[#EFE9DD]/50 px-2 py-0.5 rounded text-slate-800">
                            {selectedOrder.orderId}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Order Date &amp; Time:</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Payment Status:</span>
                          <select
                            value={editPaymentStatus}
                            onChange={(e) => setEditPaymentStatus(e.target.value as any)}
                            className="px-2 py-1 rounded-lg border border-[#EFE9DD] text-xs font-bold bg-white text-slate-800"
                          >
                            <option value="pending">Pending For Payment</option>
                            <option value="completed">Paid / Completed</option>
                            <option value="failed">Payment Failed</option>
                          </select>
                        </div>

                        {/* Order Status Select (Older Website 6 statuses) */}
                        <div className="space-y-1 pt-1 border-t border-[#EFE9DD]/60">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Order Status:
                          </label>
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as OrderStatusType)}
                            className="w-full px-3 py-2 rounded-xl border border-[#EFE9DD] text-xs font-bold bg-[#F8F6F0] text-[#1F3A2E] focus:ring-2 focus:ring-[#1F3A2E]"
                          >
                            <option value="pending">Pending for Approval</option>
                            <option value="accepted">Accept</option>
                            <option value="dispatched">Dispatch</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="returned_by_customer">Return by Customer</option>
                            <option value="cancelled_by_seller">Cancel by Seller</option>
                            <option value="return_received">Return Received</option>
                          </select>
                        </div>

                        {/* Delivery By */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Delivery By:
                          </label>
                          <input
                            type="text"
                            value={editDeliveryName}
                            onChange={(e) => setEditDeliveryName(e.target.value)}
                            placeholder="e.g. DTDC / Delhivery / Tirupati / Speed Post"
                            className="w-full px-3 py-2 rounded-xl border border-[#EFE9DD] text-xs bg-white focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                        </div>

                        {/* Tracking Id */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 block">
                            Tracking Id:
                          </label>
                          <input
                            type="text"
                            value={editDeliveryTrackId}
                            onChange={(e) => setEditDeliveryTrackId(e.target.value)}
                            placeholder="e.g. AWB12345678"
                            className="w-full px-3 py-2 rounded-xl border border-[#EFE9DD] text-xs font-mono bg-white focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                        </div>

                        {/* Save Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={isSavingDetails}
                            onClick={handleSaveOrderDetails}
                            className="w-full py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white font-bold text-xs shadow-sm transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {isSavingDetails ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A373]" />
                            )}
                            <span>Save Order Updates</span>
                          </button>
                        </div>

                      </div>
                    </div>

                    {/* Card 2: User / Customer Details */}
                    <div className="bg-white rounded-2xl border border-[#EFE9DD] p-4 shadow-xs space-y-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F3A2E] border-b border-[#EFE9DD] pb-2">
                        User Details
                      </h4>

                      <div className="space-y-2.5 text-slate-700">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Customer Name</span>
                          <span className="font-bold text-sm text-slate-900">{selectedOrder.customer?.fullName}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Contact</span>
                          <span className="font-semibold text-slate-800">{selectedOrder.customer?.phone}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Email</span>
                          <span className="text-slate-600">{selectedOrder.customer?.email}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold block">Shipping Address</span>
                          <p className="text-slate-600 leading-relaxed font-light">
                            {selectedOrder.shippingAddress?.address}
                            {selectedOrder.shippingAddress?.landmark && `, ${selectedOrder.shippingAddress.landmark}`}
                            <br />
                            {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Card 3: Order Items */}
                  <div className="bg-white rounded-2xl border border-[#EFE9DD] p-4 shadow-xs space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F3A2E] border-b border-[#EFE9DD] pb-2">
                      Order Items ({selectedOrder.items?.length || 0})
                    </h4>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#EFE9DD] text-slate-400 uppercase text-[10px] font-bold">
                            <th className="pb-2 text-center w-12">Image</th>
                            <th className="pb-2">Name</th>
                            <th className="pb-2 text-center w-16">Qty</th>
                            <th className="pb-2 text-right w-24">Price</th>
                            <th className="pb-2 text-right w-24">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFE9DD]">
                          {selectedOrder.items?.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="py-2.5 text-center">
                                <img
                                  src={item.product?.image}
                                  alt={item.product?.name}
                                  className="w-10 h-10 rounded-lg object-cover mx-auto border border-[#EFE9DD]"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </td>
                              <td className="py-2.5 font-bold text-slate-800">
                                {item.product?.name}
                              </td>
                              <td className="py-2.5 text-center font-semibold text-slate-700">
                                {item.quantity}
                              </td>
                              <td className="py-2.5 text-right font-medium text-slate-700">
                                ₹{item.price}
                              </td>
                              <td className="py-2.5 text-right font-bold text-[#1F3A2E]">
                                ₹{item.total || item.price * item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Card 4: Order Summary */}
                  <div className="bg-white rounded-2xl border border-[#EFE9DD] p-4 shadow-xs space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#1F3A2E] border-b border-[#EFE9DD] pb-2">
                      Order Summary
                    </h4>

                    <div className="space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Sub Total:</span>
                        <span className="font-bold text-slate-800">₹{selectedOrder.pricing?.subtotal || 0}</span>
                      </div>

                      {selectedOrder.pricing?.discount ? (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Discount {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}:</span>
                          <span>− ₹{selectedOrder.pricing.discount}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>₹0</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Delivery / Shipping:</span>
                        <span className="font-medium text-slate-800">
                          {selectedOrder.pricing?.shipping ? `₹${selectedOrder.pricing.shipping}` : '₹0 (Free)'}
                        </span>
                      </div>

                      {(selectedOrder.pricing?.sgst || selectedOrder.pricing?.tax) ? (
                        <>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>SGST:</span>
                            <span>₹{selectedOrder.pricing?.sgst || Math.round(((selectedOrder.pricing?.tax || 0) / 2) * 100) / 100}</span>
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>CGST:</span>
                            <span>₹{selectedOrder.pricing?.cgst || Math.round(((selectedOrder.pricing?.tax || 0) / 2) * 100) / 100}</span>
                          </div>
                        </>
                      ) : null}

                      <div className="flex justify-between text-sm font-bold text-[#1F3A2E] pt-2 border-t border-[#EFE9DD]">
                        <span>Total:</span>
                        <span>₹{selectedOrder.pricing?.total || 0}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                      <strong>Customer Delivery Notes:</strong> {selectedOrder.notes}
                    </div>
                  )}

                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-[#EFE9DD] bg-white flex items-center justify-between">
                  <button
                    onClick={() => setInvoiceOrder(selectedOrder)}
                    className="px-4 py-2 rounded-xl bg-[#1F3A2E]/10 hover:bg-[#1F3A2E]/20 text-[#1F3A2E] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>View &amp; Print Official Invoice</span>
                  </button>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
