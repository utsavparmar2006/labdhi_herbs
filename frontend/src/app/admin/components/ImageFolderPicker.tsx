'use client';

import { useState, useRef } from 'react';
import {
  UploadCloud,
  FolderOpen,
  ImageIcon,
  Loader2,
  Trash2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { uploadImageFile } from '../../../services/api';

interface ImageFolderPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'banner' | 'landscape' | 'portrait' | 'any';
  recommendedDimensions?: string;
  allowedFormats?: string[];
}

export default function ImageFolderPicker({
  value,
  onChange,
  label = 'Photo Upload',
  helperText = 'Choose a photo from your computer folder or drag & drop.',
  aspectRatio = 'any',
  recommendedDimensions,
  allowedFormats = ['JPG', 'JPEG', 'PNG', 'WebP'],
}: ImageFolderPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [detectedSpecs, setDetectedSpecs] = useState<string | null>(null);

  // Helper to read image dimensions
  const inspectImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load image for dimension check'));
      };
      img.src = objectUrl;
    });
  };

  const validateAndProcessFile = async (file: File) => {
    setUploadError('');
    setWarningMessage('');
    setDetectedSpecs(null);

    // 1. Format validation
    const ext = (file.name.split('.').pop() || '').toUpperCase();
    const isValidMime = file.type.startsWith('image/');
    const isAllowedExt = allowedFormats.map((f) => f.toUpperCase()).includes(ext);

    if (!isValidMime || !isAllowedExt) {
      setUploadError(
        `Invalid file format (.${ext.toLowerCase() || 'unknown'}). Allowed formats: ${allowedFormats.join(', ')}.`
      );
      return;
    }

    // 2. Image dimension & aspect ratio validation
    try {
      const { width, height } = await inspectImageDimensions(file);
      const ratio = width / height;
      const detectedText = `${width} × ${height} px`;
      setDetectedSpecs(detectedText);

      if (aspectRatio === 'square') {
        if (ratio < 0.85 || ratio > 1.15) {
          setWarningMessage(
            `Notice: Uploaded image is ${width} × ${height} px. A 1:1 Square (${recommendedDimensions || 'e.g. 1000×1000 px'}) is strongly recommended for uniform alignment.`
          );
        }
      } else if (aspectRatio === 'banner') {
        if (ratio < 1.6) {
          setWarningMessage(
            `Notice: Uploaded image is ${width} × ${height} px. A wide banner ratio (${recommendedDimensions || 'e.g. 1920×640 px or 16:9'}) is recommended to prevent cropping.`
          );
        }
      } else if (aspectRatio === 'landscape') {
        if (ratio < 1.2) {
          setWarningMessage(
            `Notice: Uploaded image is ${width} × ${height} px. A landscape ratio (${recommendedDimensions || 'e.g. 16:9 or 1200×675 px'}) is recommended.`
          );
        }
      } else if (aspectRatio === 'portrait') {
        if (ratio > 0.9) {
          setWarningMessage(
            `Notice: Uploaded image is ${width} × ${height} px. A vertical portrait ratio (${recommendedDimensions || 'e.g. 9:16 or 4:5'}) is recommended.`
          );
        }
      }
    } catch {
      // Continue upload if dimension inspection fails
    }

    // 3. Perform upload
    setIsUploading(true);
    const res = await uploadImageFile(file);
    setIsUploading(false);

    if (res.success && res.url) {
      onChange(res.url);
    } else {
      setUploadError(res.message || 'Failed to upload image from folder.');
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    validateAndProcessFile(file);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const defaultDimensionBadge =
    recommendedDimensions ||
    (aspectRatio === 'square'
      ? '1000 × 1000 px (1:1 Square)'
      : aspectRatio === 'banner'
      ? '1920 × 640 px (Wide Banner)'
      : aspectRatio === 'landscape'
      ? '1200 × 675 px (16:9 Landscape)'
      : aspectRatio === 'portrait'
      ? '1080 × 1920 px (9:16 Portrait)'
      : 'Standard web size');

  return (
    <div className="space-y-2.5">
      {/* Label and Sub-header with Aspect Ratio Spec Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>{label}</span>
          </label>
          {helperText && <p className="text-[11px] text-slate-400 font-light">{helperText}</p>}
        </div>

        {/* Aspect Ratio & Format Guidance Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-semibold text-[#1F3A2E] bg-[#1F3A2E]/8 px-2 py-0.5 rounded-md border border-[#1F3A2E]/15">
            📐 {defaultDimensionBadge}
          </span>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {allowedFormats.join(', ')}
          </span>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload Dropzone from Folder */}
      {!value ? (
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
              <p className="text-xs font-bold text-[#1F3A2E]">Uploading photo from folder...</p>
              <p className="text-[11px] text-slate-400">Saving to store uploads</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6 text-[#B58A5A]" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Click to choose or drag &amp; drop photo from folder
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Recommended Aspect Ratio: <span className="font-bold text-[#1F3A2E]">{defaultDimensionBadge}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-light">
                  Formats: {allowedFormats.join(', ')}
                </p>
              </div>

              <div>
                <span className="px-4 py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <FolderOpen className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Choose Photo from Folder</span>
                </span>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center justify-center gap-1.5">
              <span>✕</span>
              <span>{uploadError}</span>
            </div>
          )}

          {warningMessage && !uploadError && (
            <div className="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 flex items-center justify-center gap-1.5">
              <span>⚠️</span>
              <span>{warningMessage}</span>
            </div>
          )}
        </div>
      ) : (
        /* CURRENT SELECTED IMAGE PREVIEW BAR */
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
          <div className="w-16 h-14 rounded-xl overflow-hidden border border-[#EFE9DD] bg-slate-100 shrink-0 relative">
            <img
              src={value.startsWith('http') ? value : `http://localhost:5000${value}`}
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-slate-800 truncate">
                {value.split('/').pop() || 'Selected Photo'}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-slate-400 truncate font-mono">{value}</p>
              {detectedSpecs && (
                <span className="text-[10px] font-semibold text-[#1F3A2E] bg-[#1F3A2E]/10 px-1.5 py-0.2 rounded shrink-0">
                  {detectedSpecs}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3 py-1.5 rounded-lg border border-[#EFE9DD] hover:bg-[#F8F6F0] text-[11px] font-bold text-[#1F3A2E] transition-colors cursor-pointer flex items-center gap-1"
            >
              {isUploading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 text-[#B58A5A]" />
              )}
              <span>Change From Folder</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Remove photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
