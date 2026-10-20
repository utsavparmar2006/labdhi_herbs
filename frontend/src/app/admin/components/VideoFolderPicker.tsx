'use client';

import { useState, useRef } from 'react';
import {
  Video,
  FolderOpen,
  UploadCloud,
  Loader2,
  Trash2,
  PlayCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { uploadVideoFile } from '../../../services/api';

interface VideoFolderPickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: 'portrait' | 'landscape' | 'any';
  recommendedResolution?: string;
  allowedFormats?: string[];
}

export default function VideoFolderPicker({
  value,
  onChange,
  label = 'Cinematic Hero Video',
  helperText = 'Upload an MP4, WebM, or MOV video file from your computer folder.',
  aspectRatio = 'any',
  recommendedResolution,
  allowedFormats = ['MP4', 'WebM', 'MOV'],
}: VideoFolderPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [detectedSpecs, setDetectedSpecs] = useState<string | null>(null);

  // Helper to read video dimensions and duration
  const inspectVideoMetadata = (
    file: File
  ): Promise<{ width: number; height: number; duration: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load video metadata'));
      };
      video.src = objectUrl;
    });
  };

  const validateAndProcessVideo = async (file: File) => {
    setUploadError('');
    setWarningMessage('');
    setDetectedSpecs(null);

    // 1. Format check
    const ext = (file.name.split('.').pop() || '').toUpperCase();
    const isAllowedExt = allowedFormats.map((f) => f.toUpperCase()).includes(ext);
    const isVideoMime = file.type.startsWith('video/') || ext === 'MOV' || ext === 'MP4' || ext === 'WEBM';

    if (!isAllowedExt && !isVideoMime) {
      setUploadError(
        `Invalid video format (.${ext.toLowerCase() || 'unknown'}). Allowed formats: ${allowedFormats.join(', ')}.`
      );
      return;
    }

    // 2. Inspect video dimensions and duration
    try {
      const { width, height, duration } = await inspectVideoMetadata(file);
      const durationSec = Math.round(duration);
      const specsText = `${width} × ${height} px • ${durationSec}s`;
      setDetectedSpecs(specsText);

      if (aspectRatio === 'portrait' && width > height) {
        setWarningMessage(
          `Notice: Uploaded video is landscape (${width} × ${height} px). Vertical 9:16 (${recommendedResolution || '1080×1920 px'}) is recommended for mobile reels.`
        );
      } else if (aspectRatio === 'landscape' && height > width) {
        setWarningMessage(
          `Notice: Uploaded video is vertical (${width} × ${height} px). Widescreen 16:9 (${recommendedResolution || '1920×1080 px'}) is recommended for hero banner.`
        );
      }
    } catch {
      // Continue if browser cannot decode metadata directly
    }

    // 3. Perform upload
    setIsUploading(true);
    const res = await uploadVideoFile(file);
    setIsUploading(false);

    if (res.success && res.url) {
      onChange(res.url);
    } else {
      setUploadError(res.message || 'Failed to upload video from folder.');
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    validateAndProcessVideo(file);
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

  const defaultResolutionBadge =
    recommendedResolution ||
    (aspectRatio === 'portrait'
      ? '1080 × 1920 px (9:16 Reel)'
      : aspectRatio === 'landscape'
      ? '1920 × 1080 px (16:9 Full HD)'
      : 'Web-optimized HD');

  return (
    <div className="space-y-2.5">
      {/* Header with Aspect Ratio Guidance Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>{label}</span>
          </label>
          {helperText && <p className="text-[11px] text-slate-400 font-light">{helperText}</p>}
        </div>

        {/* Video Aspect Ratio & Format Guidance Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] font-semibold text-[#1F3A2E] bg-[#1F3A2E]/8 px-2 py-0.5 rounded-md border border-[#1F3A2E]/15">
            🎥 {defaultResolutionBadge}
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
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* UPLOAD FROM FOLDER (DRAG & DROP + OS BROWSE) */}
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
              <p className="text-xs font-bold text-[#1F3A2E]">Uploading video from folder...</p>
              <p className="text-[11px] text-slate-400">Saving media asset (this may take a few moments)</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6 text-[#B58A5A]" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  Click to select or drag &amp; drop video from folder
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Recommended Aspect Ratio: <span className="font-bold text-[#1F3A2E]">{defaultResolutionBadge}</span>
                </p>
                <p className="text-[10px] text-slate-400 font-light">
                  Formats: {allowedFormats.join(', ')}
                </p>
              </div>

              <div>
                <span className="px-4 py-2 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all">
                  <FolderOpen className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Choose Video from Computer Folder</span>
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
        /* SELECTED VIDEO LIVE PREVIEW CARD */
        <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center shrink-0">
                <PlayCircle className="w-4 h-4 text-[#B58A5A]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {value.split('/').pop() || 'Active Video'}
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
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
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
                <span>Change Video from Folder</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Player Preview */}
          <div className="rounded-xl overflow-hidden bg-black/90 max-h-56 flex items-center justify-center">
            <video
              src={value.startsWith('http') ? value : `http://localhost:5000${value}`}
              controls
              playsInline
              className="w-full max-h-56 object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
