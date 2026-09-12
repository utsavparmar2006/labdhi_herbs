'use client';

import { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderOpen,
  ImageIcon,
  Loader2,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { uploadImageFile } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiImageFolderPickerProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  helperText?: string;
  maxImages?: number;
}

export default function MultiImageFolderPicker({
  images,
  onChange,
  label = 'Product Photography Set',
  helperText = 'Upload multiple high-resolution photos for this product from your computer folder.',
  maxImages = 8,
}: MultiImageFolderPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleMultipleFiles = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    // Filter images only
    const validFiles = filesArray.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setUploadError('Please select valid image files (JPG, PNG, WebP, SVG, GIF).');
      return;
    }

    if (images.length + validFiles.length > maxImages) {
      setUploadError(`You can attach a maximum of ${maxImages} images per product.`);
    }

    setIsUploading(true);
    setUploadError('');
    const uploadedUrls: string[] = [];

    for (let i = 0; i < validFiles.length; i++) {
      if (images.length + uploadedUrls.length >= maxImages) break;
      const file = validFiles[i];
      setUploadStatusText(`Uploading ${i + 1} of ${validFiles.length}: ${file.name}...`);
      const res = await uploadImageFile(file);
      if (res.success && res.url) {
        uploadedUrls.push(res.url);
      }
    }

    setIsUploading(false);
    setUploadStatusText('');

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
    } else {
      setUploadError('Failed to upload selected images.');
    }
  };

  const onDragOverHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeaveHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDropHandler = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimary = (indexToMakePrimary: number) => {
    if (indexToMakePrimary === 0) return;
    const target = images[indexToMakePrimary];
    const remaining = images.filter((_, idx) => idx !== indexToMakePrimary);
    onChange([target, ...remaining]);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <div className="space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>{label}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1F3A2E]/10 text-[#1F3A2E]">
              {images.length} / {maxImages} Photos
            </span>
          </label>
          {helperText && <p className="text-[11px] text-slate-400 font-light">{helperText}</p>}
        </div>

        <span className="text-[11px] font-semibold text-[#1F3A2E] bg-[#1F3A2E]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
          <FolderOpen className="w-3 h-3 text-[#B58A5A]" />
          <span>Upload From Folder</span>
        </span>
      </div>

      {/* Hidden Multiple File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleMultipleFiles(e.target.files);
          }
        }}
      />

      {/* UPLOAD MULTIPLE FROM COMPUTER FOLDER */}
      {images.length < maxImages && (
        <div
          onDragOver={onDragOverHandler}
          onDragLeave={onDragLeaveHandler}
          onDrop={onDropHandler}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-[#1F3A2E] bg-[#1F3A2E]/5 scale-[1.01]'
              : 'border-[#EFE9DD] bg-[#F8F6F0]/60 hover:bg-[#F8F6F0] hover:border-[#1F3A2E]/40'
          }`}
        >
          {isUploading ? (
            <div className="py-6 space-y-2">
              <Loader2 className="w-8 h-8 text-[#1F3A2E] animate-spin mx-auto" />
              <p className="text-xs font-bold text-[#1F3A2E]">{uploadStatusText || 'Uploading photos from folder...'}</p>
              <p className="text-[11px] text-slate-400">Saving images to store media assets</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6 text-[#B58A5A]" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Click to select or drag &amp; drop photos from folder
                </p>
                <p className="text-[11px] text-slate-400 font-light">
                  Hold Ctrl / Shift to select multiple images from your computer folder at once (up to {maxImages} images)
                </p>
              </div>

              <div>
                <span className="px-4 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all">
                  <FolderOpen className="w-4 h-4 text-[#D4A373]" />
                  <span>Choose Multiple Photos from Folder</span>
                </span>
              </div>
            </div>
          )}

          {uploadError && (
            <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>
          )}
        </div>
      )}

      {/* ATTACHED IMAGES GALLERY & REORDERING GRID */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Attached Product Photos ({images.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Photo #1 is the Primary Cover Image
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3">
            <AnimatePresence>
              {images.map((imgUrl, idx) => (
                <motion.div
                  key={`${imgUrl}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative rounded-2xl overflow-hidden border-2 bg-white shadow-xs transition-all ${
                    idx === 0
                      ? 'border-[#1F3A2E] ring-2 ring-[#1F3A2E]/20'
                      : 'border-[#EFE9DD] hover:border-slate-400'
                  }`}
                >
                  <div className="aspect-square relative overflow-hidden bg-slate-100">
                    <img
                      src={imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`}
                      alt={`Product Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Primary Badge */}
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#1F3A2E] text-white text-[10px] font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 text-[#D4A373] fill-[#D4A373]" />
                        <span>Primary Cover</span>
                      </div>
                    )}

                    {/* Order Number */}
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      #{idx + 1}
                    </div>

                    {/* Quick Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(idx);
                          }}
                          className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-md"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(idx, idx - 1);
                              }}
                              className="p-1 rounded-lg bg-white/90 hover:bg-white text-slate-800 transition-colors cursor-pointer"
                              title="Move left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMove(idx, idx + 1);
                              }}
                              className="p-1 rounded-lg bg-white/90 hover:bg-white text-slate-800 transition-colors cursor-pointer"
                              title="Move right"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetPrimary(idx);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#D4A373] text-[#1F3A2E] text-[10px] font-bold hover:bg-[#c69260] transition-colors cursor-pointer shadow-md"
                          >
                            Set Primary
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add More button in grid if under max */}
              {images.length < maxImages && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-[#EFE9DD] hover:border-[#1F3A2E] bg-white hover:bg-[#F8F6F0] flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-slate-500 hover:text-[#1F3A2E]"
                >
                  <Plus className="w-5 h-5 text-[#B58A5A]" />
                  <span className="text-[11px] font-bold">Add from Folder</span>
                </button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
