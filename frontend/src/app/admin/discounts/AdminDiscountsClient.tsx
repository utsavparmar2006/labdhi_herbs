'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../../../services/api';
import { Coupon, DiscountType, MinimumRequirementType, CouponStatus } from '../../../types';
import {
  Tag,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Percent,
  IndianRupee,
  Truck,
  RotateCcw,
  Check,
  X,
  Calendar,
  Clock,
  Sparkles,
  Copy,
  Users,
  CreditCard,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDiscountsClient() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Notification Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete Dialog State
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State (7 Sections matching reference)
  const defaultFormData = {
    code: '',
    type: 'percentage' as DiscountType,
    value: 10,
    minimumRequirement: 'none' as MinimumRequirementType,
    minAmount: 0,
    minQuantity: 0,
    onlinePaymentOnly: false,
    limitTotalUsage: false,
    totalUsageLimit: 100,
    limitPerCustomer: false,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    status: 'active' as CouponStatus,
    showInList: true,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [formError, setFormError] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Coupons
  const fetchCouponsList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getCoupons({
        status: statusFilter,
        search: searchQuery,
      });
      if (res.success && Array.isArray(res.data)) {
        setCoupons(res.data);
      } else {
        setCoupons([]);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchCouponsList();
  }, [fetchCouponsList]);

  // Generate Random Code
  const handleGenerateCode = () => {
    const prefixes = ['LH', 'AYUR', 'HERB', 'SPECIAL', 'SAVE'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    const newCode = `${prefix}${num}${randomSuffix}`;
    setFormData((prev) => ({ ...prev, code: newCode }));
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingCouponId(null);
    setFormData(defaultFormData);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (coupon: Coupon) => {
    setModalMode('edit');
    setEditingCouponId(coupon._id);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minimumRequirement: coupon.minimumRequirement,
      minAmount: coupon.minAmount || 0,
      minQuantity: coupon.minQuantity || 0,
      onlinePaymentOnly: Boolean(coupon.onlinePaymentOnly),
      limitTotalUsage: Boolean(coupon.limitTotalUsage),
      totalUsageLimit: coupon.totalUsageLimit || 0,
      limitPerCustomer: Boolean(coupon.limitPerCustomer),
      startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
      endDate: new Date(coupon.endDate).toISOString().slice(0, 16),
      status: coupon.status,
      showInList: Boolean(coupon.showInList),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Save Coupon (Create or Update)
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.code.trim()) {
      setFormError('Coupon code is required');
      return;
    }

    if (formData.type !== 'free_shipping' && Number(formData.value) <= 0) {
      setFormError('Please enter a valid discount value greater than 0');
      return;
    }

    if (formData.type === 'percentage' && Number(formData.value) > 100) {
      setFormError('Percentage discount cannot exceed 100%');
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setFormError('End expiry date must be after the start date');
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === 'create') {
        const res = await createCoupon(formData);
        if (res.success) {
          showToast(`Coupon ${formData.code.toUpperCase()} created successfully!`, 'success');
          setIsModalOpen(false);
          fetchCouponsList();
        } else {
          setFormError(res.message || 'Failed to create coupon');
        }
      } else if (editingCouponId) {
        const res = await updateCoupon(editingCouponId, formData);
        if (res.success) {
          showToast(`Coupon ${formData.code.toUpperCase()} updated successfully!`, 'success');
          setIsModalOpen(false);
          fetchCouponsList();
        } else {
          setFormError(res.message || 'Failed to update coupon');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error saving coupon');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle Coupon Status
  const handleToggleStatus = async (id: string, currentCode: string) => {
    try {
      const res = await toggleCouponStatus(id);
      if (res.success) {
        showToast(`Status updated for ${currentCode}`, 'success');
        fetchCouponsList();
      } else {
        showToast(res.message || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Coupon
  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteCoupon(couponToDelete._id);
      if (res.success) {
        showToast(`Coupon ${couponToDelete.code} deleted successfully`, 'success');
        setCouponToDelete(null);
        fetchCouponsList();
      } else {
        showToast(res.message || 'Failed to delete coupon', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Quick stats calculation
  const totalCouponsCount = coupons.length;
  const activeCouponsCount = coupons.filter((c) => c.status === 'active').length;
  const inactiveCouponsCount = coupons.filter((c) => c.status === 'inactive').length;
  const totalUsageSum = coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0);

  return (
    <div className="flex h-screen bg-[#F8F6F0] font-sans antialiased text-[#1A201C] overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader
          onToggleMobileMenu={() => setIsMobileSidebarOpen(true)}
          title="Discount Management"
        />

        {/* Toast Alert Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-3 ${
                toast.type === 'success'
                  ? 'bg-[#1F3A2E] text-white border-emerald-500/30'
                  : 'bg-rose-900 text-white border-rose-500/30'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#D4A373]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-300" />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <Tag className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Promotions & Campaigns</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C] tracking-tight">
                Discount Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-light mt-1">
                Configure promotional coupons, percentage discounts, flat cashbacks, minimum order requirements, and expiry limits.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D4A373]" />
              <span>Create Coupon</span>
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Coupons</span>
                <div className="w-8 h-8 rounded-xl bg-[#1F3A2E]/10 flex items-center justify-center text-[#1F3A2E]">
                  <Tag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1A201C] mt-2 font-serif">{totalCouponsCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Active Coupons</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-serif">{activeCouponsCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">In-Active Coupons</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-2 font-serif">{inactiveCouponsCount}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Total Redemptions</span>
                <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 text-[#1F3A2E] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#B58A5A]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1F3A2E] mt-2 font-serif">{totalUsageSum}</p>
            </div>
          </div>

          {/* Search & Filter Bar (Matching Reference Layout) */}
          <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search coupon...."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#1A201C] focus:outline-none focus:border-[#1F3A2E] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Select Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs font-semibold text-[#1F3A2E] focus:outline-none focus:border-[#1F3A2E] cursor-pointer"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">In-Active</option>
              </select>

              <button
                onClick={fetchCouponsList}
                title="Refresh Table"
                className="p-2 rounded-xl bg-[#F8F6F0] hover:bg-[#EFE9DD] border border-[#EFE9DD] text-slate-600 hover:text-[#1F3A2E] transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Coupons Data Table */}
          <div className="bg-white rounded-2xl border border-[#EFE9DD] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#1A201C]">
                <thead className="bg-[#F8F6F0] text-slate-600 font-bold border-b border-[#EFE9DD] uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3.5 w-12 text-center">#</th>
                    <th className="px-4 py-3.5">Coupon Code</th>
                    <th className="px-4 py-3.5">Coupon Amount / Percent</th>
                    <th className="px-4 py-3.5">Requirements & Rules</th>
                    <th className="px-4 py-3.5">Active Date</th>
                    <th className="px-4 py-3.5">End Date</th>
                    <th className="px-4 py-3.5 text-center">Usage</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DD]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RotateCcw className="w-5 h-5 animate-spin text-[#1F3A2E]" />
                          <span>Loading discount coupons...</span>
                        </div>
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Tag className="w-8 h-8 text-slate-300" />
                          <p className="font-medium text-slate-600">No discount coupons found</p>
                          <p className="text-xs text-slate-400">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Try adjusting your search or status filter.'
                              : 'Click "+ Create Coupon" above to add your first promotion.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon, index) => {
                      const isExpired = new Date(coupon.endDate) < new Date();
                      return (
                        <tr key={coupon._id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                          <td className="px-4 py-3 text-center text-slate-400 font-medium">
                            {index + 1}
                          </td>

                          {/* Coupon Code with Copy */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-[#1F3A2E] bg-[#1F3A2E]/5 px-2.5 py-1 rounded-lg border border-[#1F3A2E]/10">
                                {coupon.code}
                              </span>
                              <button
                                onClick={() => handleCopyCode(coupon.code)}
                                title="Copy code"
                                className="text-slate-400 hover:text-[#1F3A2E] transition-colors p-1"
                              >
                                {copiedCode === coupon.code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Coupon Amount / Percent */}
                          <td className="px-4 py-3 font-semibold">
                            {coupon.type === 'percentage' && (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Percent className="w-3.5 h-3.5" />
                                <span>{coupon.value}% OFF</span>
                              </span>
                            )}
                            {coupon.type === 'fixed_amount' && (
                              <span className="text-[#1F3A2E] font-bold flex items-center gap-0.5">
                                <span>₹{coupon.value} FLAT OFF</span>
                              </span>
                            )}
                            {coupon.type === 'free_shipping' && (
                              <span className="text-blue-700 font-bold flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5" />
                                <span>Free Express Delivery</span>
                              </span>
                            )}
                          </td>

                          {/* Requirements & Restrictions */}
                          <td className="px-4 py-3 text-[11px] text-slate-600 space-y-0.5">
                            {coupon.minimumRequirement === 'amount' && (
                              <div>Min Order: <strong className="text-slate-800">₹{coupon.minAmount}</strong></div>
                            )}
                            {coupon.minimumRequirement === 'quantity' && (
                              <div>Min Qty: <strong className="text-slate-800">{coupon.minQuantity} items</strong></div>
                            )}
                            {coupon.minimumRequirement === 'none' && (
                              <div className="text-slate-400 italic">No minimum spend</div>
                            )}
                            {coupon.onlinePaymentOnly && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                                <CreditCard className="w-2.5 h-2.5" />
                                Online Only
                              </span>
                            )}
                          </td>

                          {/* Active Date */}
                          <td className="px-4 py-3 text-slate-600 text-[11px]">
                            {new Date(coupon.startDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          {/* End Date with Status */}
                          <td className="px-4 py-3 text-[11px]">
                            <div className="flex flex-col">
                              <span className={isExpired ? 'text-rose-600 line-through' : 'text-slate-700 font-medium'}>
                                {new Date(coupon.endDate).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                              {isExpired && (
                                <span className="text-[10px] text-rose-600 font-bold uppercase">Expired</span>
                              )}
                            </div>
                          </td>

                          {/* Usage Count */}
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
                              {coupon.usageCount || 0}
                              {coupon.limitTotalUsage && coupon.totalUsageLimit && (
                                <span className="text-slate-400 font-normal">/ {coupon.totalUsageLimit}</span>
                              )}
                            </span>
                          </td>

                          {/* Status Toggle Switch */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleToggleStatus(coupon._id, coupon.code)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                coupon.status === 'active' && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  coupon.status === 'active' && !isExpired ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}
                              />
                              <span>{coupon.status === 'active' ? 'Active' : 'In-Active'}</span>
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(coupon)}
                                title="Edit Coupon"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-[#1F3A2E] hover:bg-[#EFE9DD] transition-all cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setCouponToDelete(coupon)}
                                title="Delete Coupon"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
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

      {/* CREATE / EDIT COUPON MODAL (7 Reference Sections) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EFE9DD] overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-[#1F3A2E] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#D4A373] border border-white/10">
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold">
                      {modalMode === 'create' ? 'Create Promotional Coupon' : 'Edit Promotional Coupon'}
                    </h2>
                    <p className="text-xs text-emerald-100/75">
                      Configure coupon parameters, minimum spend, restrictions, and expiry.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Scrollable Body */}
              <form onSubmit={handleSaveCoupon} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Section 1: Coupon Code */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Section 1: Coupon Code
                  </span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        required
                        placeholder="e.g. HERBAL10, BIGBUY15"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EFE9DD] font-mono text-sm font-bold text-[#1F3A2E] focus:outline-none focus:border-[#1F3A2E] uppercase"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#1F3A2E] text-[#1F3A2E] hover:text-white border border-[#EFE9DD] font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Generate Code</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Customers will enter this exact code at checkout to claim the discount.
                  </p>
                </div>

                {/* Section 2 & 3: Discount Type & Value */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-4">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Section 2: Discount Type & Value
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        formData.type === 'percentage'
                          ? 'bg-white border-[#1F3A2E] shadow-sm text-[#1F3A2E] font-bold'
                          : 'bg-white/50 border-[#EFE9DD] text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        checked={formData.type === 'percentage'}
                        onChange={() => setFormData({ ...formData, type: 'percentage' })}
                        className="text-[#1F3A2E]"
                      />
                      <span>Percentage (%)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        formData.type === 'fixed_amount'
                          ? 'bg-white border-[#1F3A2E] shadow-sm text-[#1F3A2E] font-bold'
                          : 'bg-white/50 border-[#EFE9DD] text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        checked={formData.type === 'fixed_amount'}
                        onChange={() => setFormData({ ...formData, type: 'fixed_amount' })}
                        className="text-[#1F3A2E]"
                      />
                      <span>Free amount (₹)</span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        formData.type === 'free_shipping'
                          ? 'bg-white border-[#1F3A2E] shadow-sm text-[#1F3A2E] font-bold'
                          : 'bg-white/50 border-[#EFE9DD] text-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="discountType"
                        checked={formData.type === 'free_shipping'}
                        onChange={() => setFormData({ ...formData, type: 'free_shipping' })}
                        className="text-[#1F3A2E]"
                      />
                      <span>Free shipping</span>
                    </label>
                  </div>

                  {formData.type !== 'free_shipping' && (
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700">
                        {formData.type === 'percentage' ? 'Percentage Value (%)' : 'Discount Amount (₹)'}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={formData.type === 'percentage' ? 100 : 100000}
                          value={formData.value}
                          onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EFE9DD] font-bold text-sm text-[#1F3A2E] focus:outline-none focus:border-[#1F3A2E]"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          {formData.type === 'percentage' ? '%' : '₹'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Minimum Requirements */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Section 3: Minimum Requirements
                  </span>

                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="minReq"
                        checked={formData.minimumRequirement === 'none'}
                        onChange={() => setFormData({ ...formData, minimumRequirement: 'none' })}
                        className="text-[#1F3A2E]"
                      />
                      <span>None (Valid on all cart subtotals)</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="minReq"
                        checked={formData.minimumRequirement === 'amount'}
                        onChange={() => setFormData({ ...formData, minimumRequirement: 'amount' })}
                        className="text-[#1F3A2E]"
                      />
                      <span>Minimum purchase amount (₹)</span>
                    </label>

                    {formData.minimumRequirement === 'amount' && (
                      <div className="pl-6 pt-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 499"
                          value={formData.minAmount}
                          onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-white border border-[#EFE9DD] text-xs font-semibold focus:outline-none focus:border-[#1F3A2E]"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="minReq"
                        checked={formData.minimumRequirement === 'quantity'}
                        onChange={() => setFormData({ ...formData, minimumRequirement: 'quantity' })}
                        className="text-[#1F3A2E]"
                      />
                      <span>Minimum quantity of items</span>
                    </label>

                    {formData.minimumRequirement === 'quantity' && (
                      <div className="pl-6 pt-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 2"
                          value={formData.minQuantity}
                          onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-white border border-[#EFE9DD] text-xs font-semibold focus:outline-none focus:border-[#1F3A2E]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5: Payment Method Restrictions */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Section 4: Payment Restrictions
                  </span>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.onlinePaymentOnly}
                      onChange={(e) => setFormData({ ...formData, onlinePaymentOnly: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-0"
                    />
                    <span className="font-semibold text-slate-700">
                      Online Payment Only (Applies only when customer selects UPI, Card, or Netbanking)
                    </span>
                  </label>
                </div>

                {/* Section 6: Usage Limits */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-3">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Section 5: Usage Limits
                  </span>

                  <div className="space-y-2.5">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.limitTotalUsage}
                        onChange={(e) => setFormData({ ...formData, limitTotalUsage: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-0"
                      />
                      <span>Limit number of times this discount can be used in total</span>
                    </label>

                    {formData.limitTotalUsage && (
                      <div className="pl-6 pt-1">
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 1000"
                          value={formData.totalUsageLimit}
                          onChange={(e) => setFormData({ ...formData, totalUsageLimit: Number(e.target.value) })}
                          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-white border border-[#EFE9DD] text-xs font-semibold focus:outline-none focus:border-[#1F3A2E]"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.limitPerCustomer}
                        onChange={(e) => setFormData({ ...formData, limitPerCustomer: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-0"
                      />
                      <span>Limit to one use per customer</span>
                    </label>
                  </div>
                </div>

                {/* Section 7: Active Dates & Visibility */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-4">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500">
                    Section 6: Active Dates & Visibility
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Start Date & Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFE9DD] text-xs focus:outline-none focus:border-[#1F3A2E]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>End Expiry Date & Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EFE9DD] text-xs focus:outline-none focus:border-[#1F3A2E]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EFE9DD] flex flex-wrap items-center justify-between gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                        className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-0"
                      />
                      <span className="font-semibold text-slate-700">
                        Status: {formData.status === 'active' ? 'Active' : 'In-Active'}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showInList}
                        onChange={(e) => setFormData({ ...formData, showInList: e.target.checked })}
                        className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-0"
                      />
                      <span className="font-semibold text-slate-700">
                        Show In Checkout Promo List
                      </span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#EFE9DD] hover:bg-slate-100 font-semibold text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Saving Coupon...' : modalMode === 'create' ? 'Create Coupon' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {couponToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#EFE9DD] space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">Delete Coupon</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to permanently delete coupon{' '}
                  <strong className="text-slate-800 font-mono">{couponToDelete.code}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setCouponToDelete(null)}
                  className="px-5 py-2 rounded-xl border border-[#EFE9DD] hover:bg-slate-100 font-semibold text-xs text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Coupon'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
