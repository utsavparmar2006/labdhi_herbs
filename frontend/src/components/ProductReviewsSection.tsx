'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ThumbsUp,
  Camera,
  Filter,
  Check,
  ChevronDown,
  X,
  MessageCircle,
  Sparkles,
  ArrowUpDown,
  CornerDownRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
  Loader2,
} from 'lucide-react';
import WriteReviewModal from './WriteReviewModal';

interface ReviewItem {
  _id: string;
  productId: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  recommend: boolean;
  helpfulCount: number;
  helpfulUsers?: string[];
  adminReply?: {
    message: string;
    repliedAt: string;
  };
  createdAt: string;
}

interface CustomerPhoto {
  url: string;
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  onRatingUpdate?: (newRating: number, newCount: number) => void;
}

export default function ProductReviewsSection({
  productId,
  productName,
  onRatingUpdate,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [customerPhotos, setCustomerPhotos] = useState<CustomerPhoto[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    recommendPercentage: 100,
    breakdown: {
      5: { count: 0, percentage: 0 },
      4: { count: 0, percentage: 0 },
      3: { count: 0, percentage: 0 },
      2: { count: 0, percentage: 0 },
      1: { count: 0, percentage: 0 },
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [withPhotosFilter, setWithPhotosFilter] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [showDetailedReviews, setShowDetailedReviews] = useState<boolean>(false);

  // Lightbox modal state for full-screen photo viewing
  const [activePhoto, setActivePhoto] = useState<CustomerPhoto | null>(null);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (activePhoto) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [activePhoto]);

  // Local record of reviews voted helpful in this session
  const [votedHelpfulIds, setVotedHelpfulIds] = useState<Record<string, boolean>>({});

  // Stable ref for callback to prevent re-render loop
  const onRatingUpdateRef = useRef(onRatingUpdate);
  useEffect(() => {
    onRatingUpdateRef.current = onRatingUpdate;
  }, [onRatingUpdate]);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      params.append('sort', sortBy);
      if (ratingFilter) params.append('rating', ratingFilter.toString());
      if (withPhotosFilter) params.append('withPhotos', 'true');

      const response = await fetch(`${apiUrl}/reviews/product/${productId}?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load reviews');

      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews || []);
        if (data.stats) {
          setStats(data.stats);
          if (onRatingUpdateRef.current && data.stats.totalReviews > 0) {
            onRatingUpdateRef.current(data.stats.averageRating, data.stats.totalReviews);
          }
        }
        if (data.customerPhotos) {
          setCustomerPhotos(data.customerPhotos);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching product reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId, page, ratingFilter, withPhotosFilter, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle helpful vote
  const handleVoteHelpful = async (reviewId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? { ...r, helpfulCount: data.helpfulCount }
              : r
          )
        );
        setVotedHelpfulIds((prev) => ({
          ...prev,
          [reviewId]: data.hasVoted,
        }));
      }
    } catch (err) {
      console.error('Error voting review helpful:', err);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (isoDate: string) => {
    if (!isoDate) return '';
    try {
      return new Date(isoDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <section id="reviews-section" className="scroll-mt-28 space-y-8 pt-4">
      {/* Main Review Container */}
      <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14261E] tracking-tight">
                Customer Reviews & Experiences
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-light">
              Real feedback from customers across India who have used {productName}
            </p>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="self-start sm:self-auto px-6 py-3.5 rounded-2xl bg-[#14261E] hover:bg-[#1D362B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Rating Breakdown & Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F8F6F0] p-6 sm:p-8 rounded-2xl border border-[#EFE9DD]">
          
          {/* Left Column: Overall Rating Score */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-3 lg:border-r lg:border-[#EFE9DD] lg:pr-8">
            <div className="space-y-1">
              <span className="font-serif text-5xl sm:text-6xl font-extrabold text-[#14261E] tracking-tight">
                {stats.averageRating.toFixed(1)}
              </span>
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(stats.averageRating)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Based on {stats.totalReviews} customer {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>

            {stats.totalReviews > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{stats.recommendPercentage}% of customers recommend this</span>
              </div>
            )}
          </div>

          {/* Right Column: 5-Star Distribution Bars */}
          <div className="lg:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((starNumber) => {
              const row = stats.breakdown[starNumber as keyof typeof stats.breakdown] || {
                count: 0,
                percentage: 0,
              };
              const isSelected = ratingFilter === starNumber;

              return (
                <button
                  key={starNumber}
                  onClick={() => {
                    setRatingFilter(isSelected ? null : starNumber);
                    setShowDetailedReviews(true);
                    setPage(1);
                  }}
                  className={`w-full flex items-center gap-3 p-1.5 rounded-lg transition-colors text-left group cursor-pointer ${
                    isSelected ? 'bg-amber-100/60 ring-1 ring-amber-300' : 'hover:bg-black/5'
                  }`}
                  title={`Filter by ${starNumber} star reviews`}
                >
                  <span className="text-xs font-bold text-[#14261E] w-12 flex items-center gap-1 shrink-0">
                    <span>{starNumber}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </span>

                  {/* Progress Bar Container */}
                  <div className="flex-1 h-3 rounded-full bg-slate-200/80 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-amber-400 group-hover:bg-amber-500 transition-all duration-500"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>

                  <span className="text-xs text-slate-500 font-medium w-16 text-right shrink-0">
                    {row.count} ({row.percentage}%)
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Customer Photos Strip / Gallery */}
        {customerPhotos.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14261E] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4A373]" />
                <span>Customer Photos ({customerPhotos.length})</span>
              </h3>
              <span className="text-xs text-slate-400 font-light">Click image to enlarge</span>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
              {customerPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhoto(photo)}
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-[#EFE9DD] shrink-0 group focus:outline-none focus:ring-2 focus:ring-[#14261E] cursor-pointer shadow-2xs"
                >
                  <img
                    src={photo.url}
                    alt={`Customer review by ${photo.reviewerName}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle Detailed Reviews Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#EFE9DD]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#D4A373]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#14261E]">
                {stats.totalReviews > 0
                  ? `Customer Feedback & Ratings (${stats.totalReviews})`
                  : 'Customer Reviews'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-light">
              {stats.totalReviews > 0
                ? 'Click below to read all detailed customer reviews, ratings & feedback.'
                : 'Be the first customer to share your experience with this formulation!'}
            </p>
          </div>

          {stats.totalReviews > 0 && (
            <button
              type="button"
              onClick={() => setShowDetailedReviews(!showDetailedReviews)}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                showDetailedReviews
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-[#EFE9DD]'
                  : 'bg-[#14261E] hover:bg-[#1D362B] text-white shadow-md hover:shadow-lg'
              }`}
            >
              <Eye className="w-4 h-4 text-[#D4A373]" />
              <span>
                {showDetailedReviews
                  ? 'Hide Detailed Reviews'
                  : `Read All Customer Reviews (${stats.totalReviews})`}
              </span>
              {showDetailedReviews ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Detailed Reviews Drawer (Only shown when user clicks button) */}
        <AnimatePresence>
          {showDetailedReviews && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="space-y-6 pt-2 overflow-hidden border-t border-[#EFE9DD]"
            >
              {/* Filter and Sort Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                
                {/* Left: Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      setRatingFilter(null);
                      setWithPhotosFilter(false);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-colors cursor-pointer ${
                      ratingFilter === null && !withPhotosFilter
                        ? 'bg-[#14261E] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Reviews ({stats.totalReviews})
                  </button>

                  <button
                    onClick={() => {
                      setWithPhotosFilter(!withPhotosFilter);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      withPhotosFilter
                        ? 'bg-[#14261E] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>With Photos ({customerPhotos.length})</span>
                  </button>

                  {ratingFilter !== null && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      <span>{ratingFilter} Stars Only</span>
                      <button
                        onClick={() => setRatingFilter(null)}
                        className="hover:text-amber-950 cursor-pointer ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  )}
                </div>

                {/* Right: Sort Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none bg-[#F8F6F0] border border-[#EFE9DD] rounded-xl px-3 py-1.5 pr-8 font-bold text-[#14261E] cursor-pointer focus:outline-none focus:border-[#14261E]"
                    >
                      <option value="newest">Most Recent</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                      <option value="most_helpful">Most Helpful</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* Reviews List Display */}
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-7 h-7 text-[#D4A373] animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading verified customer reviews...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-16 text-center space-y-4 bg-[#F8F6F0] rounded-2xl border border-[#EFE9DD]">
                  <div className="w-12 h-12 rounded-full bg-white text-slate-400 flex items-center justify-center mx-auto border border-[#EFE9DD]">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-[#14261E]">No reviews found</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {ratingFilter || withPhotosFilter
                        ? 'No reviews match your selected filter criteria. Try resetting the filters.'
                        : 'Be the first to share your experience with this formulation!'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsWriteModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#14261E] text-white text-xs font-bold hover:bg-[#1D362B] transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Write the First Review</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-[#EFE9DD]">
                  {reviews.map((rev) => {
                    const hasVotedThis = votedHelpfulIds[rev._id];

                    return (
                      <div key={rev._id} className="pt-6 first:pt-0 space-y-3.5">
                        
                        {/* Top Bar: Reviewer info, Star Rating & Date */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar Circle */}
                            <div className="w-10 h-10 rounded-full bg-[#14261E] text-[#FAF8F5] flex items-center justify-center font-serif text-xs font-bold tracking-wider shrink-0 shadow-xs">
                              {getInitials(rev.name)}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#14261E]">
                                  {rev.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                {formatDate(rev.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Star Rating Display */}
                          <div className="flex items-center gap-1 bg-amber-50/80 px-2.5 py-1 rounded-full border border-amber-200">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= rev.rating
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review Headline & Body */}
                        <div className="space-y-1.5">
                          <h4 className="font-serif text-base font-bold text-[#14261E]">
                            {rev.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed whitespace-pre-line">
                            {rev.comment}
                          </p>
                        </div>

                        {/* Customer Uploaded Images (if any) */}
                        {rev.images && rev.images.length > 0 && (
                          <div className="flex items-center gap-2.5 pt-1">
                            {rev.images.map((imgUrl, i) => (
                              <button
                                key={i}
                                onClick={() =>
                                  setActivePhoto({
                                    url: imgUrl,
                                    reviewId: rev._id,
                                    reviewerName: rev.name,
                                    rating: rev.rating,
                                    comment: rev.comment,
                                    createdAt: rev.createdAt,
                                  })
                                }
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-[#EFE9DD] hover:scale-105 transition-transform cursor-pointer shadow-2xs"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Photo by ${rev.name}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Recommendation Badge */}
                        {rev.recommend && (
                          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                            <span>Recommends this formulation</span>
                          </div>
                        )}

                        {/* Official Merchant Reply (if any) */}
                        {rev.adminReply && rev.adminReply.message && (
                          <div className="bg-[#FAF8F5] border-l-3 border-[#14261E] rounded-r-xl p-3.5 sm:p-4 space-y-1 mt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-[#14261E]">
                              <CornerDownRight className="w-3.5 h-3.5 text-[#D4A373]" />
                              <span>Response from Labdhi Herbs</span>
                              {rev.adminReply.repliedAt && (
                                <span className="text-[10px] font-normal text-slate-400">
                                  • {formatDate(rev.adminReply.repliedAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 font-light leading-relaxed pl-5">
                              {rev.adminReply.message}
                            </p>
                          </div>
                        )}

                        {/* Bottom Actions: Helpful Button */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleVoteHelpful(rev._id)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                              hasVotedThis
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                : 'bg-white border-[#EFE9DD] text-slate-600 hover:bg-[#F8F6F0]'
                            }`}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasVotedThis ? 'fill-emerald-600 text-emerald-600' : 'text-slate-500'}`} />
                            <span>Helpful {rev.helpfulCount > 0 && `(${rev.helpfulCount})`}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Navigation */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#EFE9DD]">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-600"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          page === pageNumber
                            ? 'bg-[#14261E] text-white shadow-xs'
                            : 'border border-[#EFE9DD] hover:bg-[#F8F6F0] text-slate-600'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] disabled:opacity-40 disabled:pointer-events-none cursor-pointer text-slate-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bottom Collapse Button */}
              <div className="pt-2 text-center border-t border-[#EFE9DD]">
                <button
                  type="button"
                  onClick={() => setShowDetailedReviews(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-[#14261E] hover:bg-[#F8F6F0] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Collapse Reviews</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        productName={productName}
        onReviewSubmitted={() => {
          fetchReviews();
          setShowDetailedReviews(true);
        }}
      />

      {/* Fullscreen Photo Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-lenis-prevent="true"
              className="relative max-w-3xl w-full bg-[#14261E] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Photo View */}
                <div className="bg-black/40 flex items-center justify-center min-h-[300px] max-h-[500px]">
                  <img
                    src={activePhoto.url}
                    alt="Customer photo"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Review Details Context */}
                <div className="p-6 sm:p-8 flex flex-col justify-between text-white space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30 text-amber-300 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                        <span>{activePhoto.rating} Stars</span>
                      </div>
                      <span className="text-xs text-emerald-200/70">
                        {formatDate(activePhoto.createdAt)}
                      </span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-[#FAF8F5]">
                      Review by {activePhoto.reviewerName}
                    </h4>

                    <p className="text-xs text-emerald-100/80 font-light leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-2">
                      &ldquo;{activePhoto.comment}&rdquo;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200/60">
                    <span>Verified Customer Photo</span>
                    <button
                      onClick={() => setActivePhoto(null)}
                      className="text-white hover:underline cursor-pointer"
                    >
                      Close View
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
