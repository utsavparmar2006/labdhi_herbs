'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Camera,
  UploadCloud,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onReviewSubmitted: () => void;
}

const RATING_LABELS = [
  '',
  '1 - Poor (Needs Improvement)',
  '2 - Fair (Below Expectations)',
  '3 - Average (Decent Experience)',
  '4 - Very Good (Satisfied)',
  '5 - Excellent (Highly Recommend!)',
];

export default function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  onReviewSubmitted,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [recommend, setRecommend] = useState<boolean>(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return;
    setErrorMsg(null);

    const newFiles = Array.from(files);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const filtered = newFiles.filter((file) => validImageTypes.includes(file.type));

    if (filtered.length !== newFiles.length) {
      setErrorMsg('Some files were ignored because only JPG, PNG, and WebP images are allowed.');
    }

    if (selectedFiles.length + filtered.length > 5) {
      setErrorMsg('You can upload a maximum of 5 photos.');
      return;
    }

    const updatedFiles = [...selectedFiles, ...filtered];
    setSelectedFiles(updatedFiles);

    // Create object URLs for preview
    const newPreviews = filtered.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rating || rating < 1) {
      setErrorMsg('Please select a star rating.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a review headline / title.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please enter your detailed experience or feedback.');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('rating', rating.toString());
      formData.append('title', title.trim());
      formData.append('comment', comment.trim());
      formData.append('recommend', recommend ? 'true' : 'false');

      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const response = await fetch(`${apiUrl}/reviews/product/${productId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit review. Please try again.');
      }

      setIsSuccess(true);
      setTimeout(() => {
        onReviewSubmitted();
        handleClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setErrorMsg(null);
    setIsSuccess(false);
    onClose();
  };

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
        data-lenis-prevent="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          data-lenis-prevent="true"
          className="relative w-full max-w-2xl bg-[#F8F6F0] rounded-3xl border border-[#EFE9DD] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[88vh] sm:max-h-[90vh] my-auto"
        >
          {/* Header Banner - Fixed */}
          <div className="bg-[#14261E] px-6 py-5 text-white flex items-center justify-between border-b border-[#254235] shrink-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                <h3 className="font-serif text-lg font-bold tracking-tight text-[#FAF8F5]">
                  Write a Customer Review
                </h3>
              </div>
              <p className="text-xs text-emerald-200/80 line-clamp-1 max-w-md">
                For {productName}
              </p>
            </div>

            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 rounded-full hover:bg-white/10 text-emerald-100/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Container - Scrollable with overscroll-contain & data-lenis-prevent */}
          {isSuccess ? (
            <div className="p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-[#14261E]">
                Thank You for Your Review!
              </h4>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your feedback has been successfully recorded and published. Your genuine experience helps our Ayurvedic community make informed choices.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6"
            >
              {/* Error Notice */}
              {errorMsg && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Star Rating Picker */}
              <div className="space-y-2 bg-white p-5 rounded-2xl border border-[#EFE9DD]">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E]">
                  Overall Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const activeVal = hoverRating || rating;
                    const isFilled = starVal <= activeVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(starVal)}
                        className="p-1.5 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 hover:text-amber-200'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-semibold text-slate-600 ml-2">
                    {RATING_LABELS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              {/* Review Title / Headline */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E]">
                  Review Headline <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Visible glow in 7 days, wonderfully soothing texture"
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#EFE9DD] text-sm text-[#14261E] placeholder:text-slate-400 focus:outline-none focus:border-[#14261E] focus:ring-1 focus:ring-[#14261E] transition-all"
                />
              </div>

              {/* Review Detailed Body */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E]">
                    Detailed Experience <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {comment.length}/3000
                  </span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  maxLength={3000}
                  placeholder="Share details about the texture, fragrance, how you used it, and how your skin/body responded to this herbal formulation..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-[#EFE9DD] text-sm text-[#14261E] placeholder:text-slate-400 focus:outline-none focus:border-[#14261E] focus:ring-1 focus:ring-[#14261E] transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Customer Photos Upload */}
              <div className="space-y-3 bg-white p-5 rounded-2xl border border-[#EFE9DD]">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E] flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#D4A373]" />
                      <span>Add Photos (Optional)</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Show your real results or the formulation bottle (Up to 5 images).
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedFiles.length}/5
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />

                {/* Previews & Dropzone */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  {previewUrls.map((preview, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-[#EFE9DD] group bg-slate-50 shadow-2xs"
                    >
                      <img
                        src={preview}
                        alt={`Upload preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {selectedFiles.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-[#D4A373]/50 hover:border-[#14261E] hover:bg-[#F8F6F0] flex flex-col items-center justify-center p-2 text-slate-500 hover:text-[#14261E] transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-5 h-5 text-[#D4A373] mb-1" />
                      <span className="text-[10px] font-semibold text-center">Add Photo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Recommendation Choice */}
              <div className="bg-white p-4 rounded-2xl border border-[#EFE9DD] flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Would you recommend this formulation to others?
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      checked={recommend === true}
                      onChange={() => setRecommend(true)}
                      className="accent-[#14261E]"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      checked={recommend === false}
                      onChange={() => setRecommend(false)}
                      className="accent-[#14261E]"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {/* Customer Contact Details (Name & Email) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E]">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    maxLength={70}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EFE9DD] text-sm text-[#14261E] placeholder:text-slate-400 focus:outline-none focus:border-[#14261E] focus:ring-1 focus:ring-[#14261E] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14261E]">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    maxLength={100}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EFE9DD] text-sm text-[#14261E] placeholder:text-slate-400 focus:outline-none focus:border-[#14261E] focus:ring-1 focus:ring-[#14261E] transition-all"
                  />
                  <p className="text-[10px] text-slate-400">
                    Your email will remain completely confidential and won&apos;t be publicly displayed.
                  </p>
                </div>
              </div>

              {/* Actions Button */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EFE9DD]">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-xl border border-[#EFE9DD] text-xs font-bold text-slate-600 hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-7 py-3 rounded-xl bg-[#14261E] hover:bg-[#1D362B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                      <span>Submitting Review...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
