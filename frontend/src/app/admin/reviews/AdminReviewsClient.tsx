'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import {
  Star,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  MessageSquare,
  CornerDownRight,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  Camera,
  X,
  Package,
  ChevronDown,
  RotateCcw,
  FolderTree,
} from 'lucide-react';

interface ReviewData {
  _id: string;
  productId: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  recommend: boolean;
  status: 'approved' | 'pending' | 'rejected';
  helpfulCount: number;
  adminReply?: {
    message: string;
    repliedAt: string;
  };
  createdAt: string;
}

interface ReviewCounts {
  all: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function AdminReviewsClient() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [counts, setCounts] = useState<ReviewCounts>({
    all: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters & Pagination
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('all');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [productsList, setProductsList] = useState<{
    id: string;
    name: string;
    category?: string;
    mainCategory?: string;
    image?: string;
  }[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Compute unique main categories list
  const mainCategories = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach((p) => {
      const cat = p.mainCategory || p.category;
      if (cat && cat.trim()) set.add(cat.trim());
    });
    return Array.from(set).sort();
  }, [productsList]);

  // Fetch product list for product filter dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/products?limit=150`);
        const data = await res.json();
        if (data.success && data.data) {
          setProductsList(data.data);
        }
      } catch (err) {
        console.error('Error loading products for review filter:', err);
      }
    };
    fetchProducts();
  }, []);

  // Reply Modal State
  const [replyingReview, setReplyingReview] = useState<ReviewData | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  // Lightbox Photo State
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fetchAdminReviews = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (activeStatus !== 'all') params.append('status', activeStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (ratingFilter) params.append('rating', ratingFilter.toString());
      if (selectedMainCategory && selectedMainCategory !== 'all') params.append('mainCategory', selectedMainCategory);
      if (selectedProductId && selectedProductId !== 'all') params.append('productId', selectedProductId);

      const res = await fetch(`${apiUrl}/reviews/admin?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.counts) setCounts(data.counts);
        if (data.pagination) setTotalPages(data.pagination.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching admin reviews:', err);
      setErrorMsg(err.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [page, activeStatus, searchQuery, ratingFilter, selectedMainCategory, selectedProductId]);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  const getProductDisplay = (pid: string) => {
    const found = productsList.find((p) => p.id === pid);
    return found ? found.name : pid;
  };

  const getProductCategory = (pid: string) => {
    const found = productsList.find((p) => p.id === pid);
    return found ? found.mainCategory || found.category : '';
  };

  // Quick Status Update (Approve / Reject)
  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const res = await fetch(`${apiUrl}/reviews/admin/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Review status changed to '${newStatus}'`);
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchAdminReviews();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update review status');
    }
  };

  // Delete Review
  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const res = await fetch(`${apiUrl}/reviews/admin/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Review deleted successfully');
        setTimeout(() => setSuccessMsg(null), 3000);
        fetchAdminReviews();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  // Submit Merchant Reply
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingReview || !replyMessage.trim()) return;

    setIsSubmittingReply(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const res = await fetch(`${apiUrl}/reviews/admin/${replyingReview._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Reply added successfully!');
        setTimeout(() => setSuccessMsg(null), 3000);
        setReplyingReview(null);
        setReplyMessage('');
        fetchAdminReviews();
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F6F0] overflow-hidden text-[#1A201C]">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          title="Product Reviews & Ratings"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Header Title Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                <h1 className="text-2xl font-bold font-serif text-[#14261E]">
                  Product Reviews & Ratings
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monitor customer feedback, moderate ratings, view customer photos, and post merchant replies.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-2xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Reviews</span>
              <p className="text-2xl font-serif font-bold text-[#14261E]">{counts.all}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-2xs space-y-1">
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Approved</span>
              </span>
              <p className="text-2xl font-serif font-bold text-emerald-800">{counts.approved}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-2xs space-y-1">
              <span className="text-xs text-amber-700 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Moderation</span>
              </span>
              <p className="text-2xl font-serif font-bold text-amber-800">{counts.pending}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EFE9DD] shadow-2xs space-y-1">
              <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejected</span>
              </span>
              <p className="text-2xl font-serif font-bold text-red-700">{counts.rejected}</p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE9DD] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-xl border border-[#EFE9DD] w-full sm:w-auto">
                {[
                  { id: 'all', label: `All (${counts.all})` },
                  { id: 'approved', label: `Approved (${counts.approved})` },
                  { id: 'pending', label: `Pending (${counts.pending})` },
                  { id: 'rejected', label: `Rejected (${counts.rejected})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveStatus(tab.id);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
                      activeStatus === tab.id
                        ? 'bg-[#14261E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#14261E]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Category, Product & Star Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                {/* 1. Main Category Filter Dropdown */}
                <div className="relative w-full sm:w-52">
                  <FolderTree className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedMainCategory}
                    onChange={(e) => {
                      setSelectedMainCategory(e.target.value);
                      setSelectedProductId('all');
                      setPage(1);
                    }}
                    className="w-full bg-[#F8F6F0] border border-[#EFE9DD] rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-[#14261E] focus:outline-none focus:border-[#14261E] cursor-pointer truncate"
                  >
                    <option value="all">📂 All Categories</option>
                    {mainCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 2. Product Filter Dropdown (Grouped by Category) */}
                <div className="relative w-full sm:w-64">
                  <Package className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-[#F8F6F0] border border-[#EFE9DD] rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-[#14261E] focus:outline-none focus:border-[#14261E] cursor-pointer truncate"
                  >
                    <option value="all">
                      {selectedMainCategory !== 'all'
                        ? `🌿 All Products in ${selectedMainCategory}`
                        : '🌿 All Products (Grouped)'}
                    </option>
                    {selectedMainCategory !== 'all'
                      ? productsList
                          .filter((p) => (p.mainCategory || p.category) === selectedMainCategory)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))
                      : mainCategories.map((cat) => (
                          <optgroup key={cat} label={`── ${cat} ──`}>
                            {productsList
                              .filter((p) => (p.mainCategory || p.category) === cat)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                          </optgroup>
                        ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 3. Star Filter Dropdown */}
                <div className="relative w-full sm:w-36">
                  <select
                    value={ratingFilter || ''}
                    onChange={(e) => {
                      setRatingFilter(e.target.value ? parseInt(e.target.value) : null);
                      setPage(1);
                    }}
                    className="w-full bg-[#F8F6F0] border border-[#EFE9DD] rounded-xl px-3 py-2 pr-7 text-xs font-semibold text-[#14261E] focus:outline-none focus:border-[#14261E] cursor-pointer"
                  >
                    <option value="">All Ratings (1-5★)</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4 Stars Only</option>
                    <option value="3">3 Stars Only</option>
                    <option value="2">2 Stars Only</option>
                    <option value="1">1 Star Only</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Reset Filters button if any filter active */}
                {(selectedMainCategory !== 'all' || selectedProductId !== 'all' || ratingFilter !== null || searchQuery.trim() !== '' || activeStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedMainCategory('all');
                      setSelectedProductId('all');
                      setRatingFilter(null);
                      setSearchQuery('');
                      setActiveStatus('all');
                      setPage(1);
                    }}
                    className="px-2.5 py-2 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] text-slate-600 hover:text-[#14261E] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Reset all filters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search reviews by customer name, email, product, title, or review text..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] placeholder:text-slate-400 focus:outline-none focus:border-[#14261E]"
              />
            </div>

            {/* Active Filter Chips */}
            {(selectedMainCategory !== 'all' || selectedProductId !== 'all' || ratingFilter !== null) && (
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EFE9DD]">
                <span className="text-[11px] text-slate-400 font-medium">Active Filters:</span>
                
                {/* Category Chip */}
                {selectedMainCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                    <FolderTree className="w-3.5 h-3.5 text-amber-700" />
                    <span>Category: <strong>{selectedMainCategory}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedMainCategory('all');
                        setPage(1);
                      }}
                      className="ml-1 text-amber-700 hover:text-amber-950 cursor-pointer"
                      title="Clear category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Product Chip */}
                {selectedProductId !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <Package className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Product: <strong>{getProductDisplay(selectedProductId)}</strong></span>
                    <button
                      onClick={() => {
                        setSelectedProductId('all');
                        setPage(1);
                      }}
                      className="ml-1 text-emerald-600 hover:text-emerald-900 cursor-pointer"
                      title="Clear product filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Rating Chip */}
                {ratingFilter !== null && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>Rating: <strong>{ratingFilter} Stars</strong></span>
                    <button
                      onClick={() => {
                        setRatingFilter(null);
                        setPage(1);
                      }}
                      className="ml-1 text-amber-600 hover:text-amber-900 cursor-pointer"
                      title="Clear rating filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Reviews Table / Cards */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#D4A373] animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading customer reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-[#EFE9DD] space-y-2">
              <Star className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-serif text-base font-bold text-[#14261E]">No reviews found</h4>
              <p className="text-xs text-slate-500">
                No reviews match your current search and filter settings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  className="bg-white rounded-2xl border border-[#EFE9DD] p-5 sm:p-6 shadow-2xs space-y-4 transition-all hover:border-[#D4A373]/50"
                >
                  {/* Card Header: Product slug, User details, Star & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EFE9DD] pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#14261E]">
                          {rev.name}
                        </span>
                        <span className="text-[11px] text-slate-400">({rev.email})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        {/* Category Tag (Click to filter by category) */}
                        {getProductCategory(rev.productId) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMainCategory(getProductCategory(rev.productId) || 'all');
                              setSelectedProductId('all');
                              setPage(1);
                            }}
                            className="font-semibold text-slate-700 bg-amber-50/80 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                            title={`Filter by category: ${getProductCategory(rev.productId)}`}
                          >
                            <FolderTree className="w-3 h-3 text-amber-700" />
                            <span>{getProductCategory(rev.productId)}</span>
                          </button>
                        )}

                        {/* Product Tag (Click to filter by product) */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(rev.productId);
                            setPage(1);
                          }}
                          className="font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer text-xs group"
                          title={`Click to filter reviews for ${getProductDisplay(rev.productId)}`}
                        >
                          <Package className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                          <span className="font-bold">{getProductDisplay(rev.productId)}</span>
                          <span className="text-[10px] text-emerald-600/70 font-mono">({rev.productId})</span>
                        </button>
                        <span>•</span>
                        <span>{formatDate(rev.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          rev.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : rev.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-1.5">
                    <h4 className="font-serif text-sm font-bold text-[#14261E]">
                      {rev.title}
                    </h4>
                    <p className="text-xs text-slate-600 font-light leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>

                  {/* Uploaded Photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex items-center gap-2.5 pt-1">
                      {rev.images.map((imgUrl, i) => (
                        <button
                          key={i}
                          onClick={() => setPreviewPhoto(imgUrl)}
                          className="w-16 h-16 rounded-xl overflow-hidden border border-[#EFE9DD] hover:scale-105 transition-transform cursor-pointer shadow-2xs"
                        >
                          <img src={imgUrl} alt="Customer upload" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Official Merchant Reply if present */}
                  {rev.adminReply && rev.adminReply.message && (
                    <div className="bg-[#F8F6F0] border-l-3 border-[#14261E] p-3 rounded-r-xl space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#14261E]">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>Official Labdhi Herbs Reply</span>
                        {rev.adminReply.repliedAt && (
                          <span className="text-[10px] font-normal text-slate-400">
                            ({formatDate(rev.adminReply.repliedAt)})
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 pl-4">{rev.adminReply.message}</p>
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EFE9DD]">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{rev.helpfulCount} helpful votes</span>
                      </span>
                      {rev.recommend && (
                        <span className="text-emerald-700 font-medium">✓ Recommends product</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {rev.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(rev._id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {rev.status !== 'rejected' && (
                        <button
                          onClick={() => handleUpdateStatus(rev._id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setReplyingReview(rev);
                          setReplyMessage(rev.adminReply?.message || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#14261E] hover:bg-[#1D362B] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>{rev.adminReply?.message ? 'Edit Reply' : 'Reply'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Review Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-[#EFE9DD] bg-white hover:bg-[#F8F6F0] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-[#EFE9DD] bg-white hover:bg-[#F8F6F0] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* Reply Modal */}
      {replyingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EFE9DD] shadow-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#14261E]">
                  Merchant Response
                </h3>
                <p className="text-xs text-slate-500">
                  Replying to {replyingReview.name}&apos;s review on {replyingReview.productId}
                </p>
              </div>
              <button
                onClick={() => setReplyingReview(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReply} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E]">
                  Your Message
                </label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  placeholder="e.g. Thank you for your feedback! We are delighted that this formulation brought comfort to you..."
                  className="w-full px-4 py-3 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#14261E]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#EFE9DD]">
                <button
                  type="button"
                  onClick={() => setReplyingReview(null)}
                  className="px-4 py-2 rounded-xl border border-[#EFE9DD] text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="px-6 py-2 rounded-xl bg-[#14261E] hover:bg-[#1D362B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <span>Post Reply</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Enlarge Lightbox */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl">
            <img src={previewPhoto} alt="Customer preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
