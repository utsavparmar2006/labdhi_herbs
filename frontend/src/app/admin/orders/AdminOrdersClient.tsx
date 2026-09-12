'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { getAdminOrders, updateOrderStatus } from '../../../services/api';
import { Order, OrderStats } from '../../../types';
import {
  ShoppingBag,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Banknote,
  CreditCard,
  IndianRupee,
  Calendar,
  X,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'placed', label: 'Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
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
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status update loading state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchOrdersList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOrders({
        status: activeTab,
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
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  // Handle Order Status Update
  const handleUpdateStatus = async (
    orderId: string,
    newStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
    paymentStatus?: 'pending' | 'completed' | 'failed'
  ) => {
    setIsUpdatingStatus(true);
    try {
      const res = await updateOrderStatus(orderId, {
        status: newStatus,
        paymentStatus,
      });

      if (res.success && res.data) {
        showToast(`Order status updated to ${newStatus.toUpperCase()}`);
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...res.data } : o))
        );
        if (selectedOrder && selectedOrder.orderId === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, ...res.data } : null));
        }
        fetchOrdersList();
      } else {
        showToast(res.message || 'Failed to update order status');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating order status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>Placed</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <CheckCircle2 className="w-3 h-3 text-amber-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Package className="w-3 h-3 text-indigo-600" />
            <span>Processing</span>
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3 text-purple-600" />
            <span>Shipped</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col md:flex-row text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD]">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleMobileMenu={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Header Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                Customer Orders & Shipments
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-light mt-1">
                Manage, dispatch, and track orders across all Indian states with real-time fulfillment updates.
              </p>
            </div>

            <button
              onClick={fetchOrdersList}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EFE9DD] hover:bg-[#F8F6F0] text-xs font-bold text-slate-700 transition-colors shadow-2xs self-start cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-[#1F3A2E] text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage('')} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Orders
              </span>
              <span className="text-2xl font-bold text-[#1F3A2E] block">{stats.totalOrders}</span>
              <span className="text-[10px] text-slate-500">Lifetime customer purchases</span>
            </div>

            <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Revenue
              </span>
              <span className="text-2xl font-bold text-[#1F3A2E] block">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">All fulfilled orders</span>
            </div>

            <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending Dispatch
              </span>
              <span className="text-2xl font-bold text-amber-600 block">{stats.pendingOrders}</span>
              <span className="text-[10px] text-amber-700">Requires fulfillment</span>
            </div>

            <div className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Delivered Orders
              </span>
              <span className="text-2xl font-bold text-emerald-600 block">
                {stats.deliveredOrders}
              </span>
              <span className="text-[10px] text-emerald-700 font-medium">Successfully completed</span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white rounded-3xl border border-[#EFE9DD] p-4 sm:p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#1F3A2E] text-white shadow-xs'
                        : 'bg-[#F8F6F0] text-slate-600 hover:bg-[#EFE9DD]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID, Name, Phone..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                />
              </div>
            </div>

            {/* Orders Table */}
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
                    <tr className="border-b border-[#EFE9DD] text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <th className="pb-3 pl-2">Order ID</th>
                      <th className="pb-3">Customer Info</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3 pr-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFE9DD]">
                    {orders.map((order) => (
                      <tr key={order.orderId} className="hover:bg-[#F8F6F0]/60 transition-colors">
                        {/* Order ID */}
                        <td className="py-4 pl-2 font-mono font-bold text-[#1F3A2E]">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="hover:underline text-left cursor-pointer"
                          >
                            {order.orderId}
                          </button>
                        </td>

                        {/* Customer */}
                        <td className="py-4">
                          <div className="font-bold text-[#1A201C]">{order.customer?.fullName}</div>
                          <div className="text-[11px] text-slate-500 font-light flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[#B58A5A]" />
                            <span>{order.customer?.phone}</span>
                          </div>
                        </td>

                        {/* Items */}
                        <td className="py-4">
                          <span className="font-semibold text-slate-700 block">
                            {order.items?.length || 0} items
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                            {order.items?.[0]?.product?.name || 'Formulation'}
                            {(order.items?.length || 0) > 1 && ` + ${(order.items?.length || 0) - 1} more`}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 font-bold text-[#1F3A2E] text-sm">
                          ₹{order.pricing?.total || 0}
                        </td>

                        {/* Payment */}
                        <td className="py-4">
                          <div className="flex items-center gap-1.5">
                            {order.payment?.method === 'cod' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                COD
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                                ONLINE
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-medium ${
                                order.payment?.status === 'completed'
                                  ? 'text-emerald-600 font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              {order.payment?.status === 'completed' ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        </td>

                        {/* Order Status */}
                        <td className="py-4">{getStatusBadge(order.orderStatus)}</td>

                        {/* Date */}
                        <td className="py-4 text-[11px] text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-4 pr-2 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-xl bg-[#F8F6F0] hover:bg-[#EFE9DD] text-slate-700 transition-colors cursor-pointer"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* Order Details Modal / Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-xl bg-white shadow-2xl border-l border-[#EFE9DD] flex flex-col justify-between"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#1F3A2E] text-white">
                  <div>
                    <span className="text-[10px] font-bold text-[#D4A373] uppercase tracking-wider block">
                      Order Management
                    </span>
                    <h3 className="font-serif text-lg font-bold">
                      {selectedOrder.orderId}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Scroll Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs">
                  
                  {/* Status Progression Controls */}
                  <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                        Update Fulfillment Status
                      </span>
                      {getStatusBadge(selectedOrder.orderStatus)}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={isUpdatingStatus || selectedOrder.orderStatus === 'confirmed'}
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, 'confirmed')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                          selectedOrder.orderStatus === 'confirmed'
                            ? 'bg-amber-100 border-amber-300 text-amber-800'
                            : 'bg-white border-[#EFE9DD] hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Confirm
                      </button>

                      <button
                        type="button"
                        disabled={isUpdatingStatus || selectedOrder.orderStatus === 'shipped'}
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, 'shipped')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                          selectedOrder.orderStatus === 'shipped'
                            ? 'bg-purple-100 border-purple-300 text-purple-800'
                            : 'bg-white border-[#EFE9DD] hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Ship Out
                      </button>

                      <button
                        type="button"
                        disabled={isUpdatingStatus || selectedOrder.orderStatus === 'delivered'}
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, 'delivered', 'completed')}
                        className={`py-2 px-2.5 rounded-xl font-bold border transition-all text-center cursor-pointer ${
                          selectedOrder.orderStatus === 'delivered'
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                            : 'bg-white border-[#EFE9DD] hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        Delivered
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        disabled={isUpdatingStatus || selectedOrder.orderStatus === 'cancelled'}
                        onClick={() => handleUpdateStatus(selectedOrder.orderId, 'cancelled')}
                        className="text-[11px] text-red-600 hover:underline font-bold cursor-pointer"
                      >
                        Cancel Order
                      </button>

                      {selectedOrder.payment?.status !== 'completed' && (
                        <button
                          type="button"
                          disabled={isUpdatingStatus}
                          onClick={() =>
                            handleUpdateStatus(
                              selectedOrder.orderId,
                              selectedOrder.orderStatus,
                              'completed'
                            )
                          }
                          className="text-[11px] text-emerald-700 hover:underline font-bold cursor-pointer"
                        >
                          Mark Payment as Received
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-[#EFE9DD] pb-1.5">
                      Customer & Shipping Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Customer Name</span>
                        <span className="font-bold text-slate-800">
                          {selectedOrder.customer?.fullName}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Phone</span>
                        <span className="font-semibold text-slate-700">
                          +91 {selectedOrder.customer?.phone}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block">Email Address</span>
                        <span>{selectedOrder.customer?.email}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block">Delivery Address</span>
                        <p className="font-light leading-relaxed">
                          {selectedOrder.shippingAddress?.address}
                          {selectedOrder.shippingAddress?.landmark &&
                            `, Near ${selectedOrder.shippingAddress.landmark}`}
                          <br />
                          {selectedOrder.shippingAddress?.city},{' '}
                          {selectedOrder.shippingAddress?.state} —{' '}
                          <strong>{selectedOrder.shippingAddress?.pincode}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-[#EFE9DD] pb-1.5">
                      Ordered Products ({selectedOrder.items?.length || 0})
                    </h4>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD]"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product?.image}
                              alt={item.product?.name}
                              className="w-10 h-10 rounded-lg object-cover bg-white"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                              }}
                            />
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {item.product?.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Qty: {item.quantity} × ₹{item.price}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-[#1F3A2E]">₹{item.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment & Invoice Breakdown */}
                  <div className="space-y-2 pt-2 border-t border-[#EFE9DD]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-bold text-slate-800">
                        ₹{selectedOrder.pricing?.subtotal || 0}
                      </span>
                    </div>

                    {selectedOrder.pricing?.discount ? (
                      <div className="flex justify-between text-emerald-700">
                        <span>Coupon Discount ({selectedOrder.couponCode}):</span>
                        <span>−₹{selectedOrder.pricing.discount}</span>
                      </div>
                    ) : null}

                    <div className="flex justify-between text-slate-500">
                      <span>Express Shipping:</span>
                      <span className="font-bold text-emerald-700">FREE</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-[#1F3A2E] pt-2 border-t border-slate-100">
                      <span>Total Invoice Amount:</span>
                      <span>₹{selectedOrder.pricing?.total || 0}</span>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                      <strong>Customer Notes:</strong> {selectedOrder.notes}
                    </div>
                  )}

                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-[#EFE9DD] bg-slate-50 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-white border border-[#EFE9DD] hover:bg-[#F8F6F0] text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print Order</span>
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
