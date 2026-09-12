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
}

export default function VideoFolderPicker({
  value,
  onChange,
  label = 'Cinematic Hero Video',
  helperText = 'Upload an MP4, WebM, or MOV video file from your computer folder.',
}: VideoFolderPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isVideo = file.type.startsWith('video/') || ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext || '');

    if (!isVideo) {
      setUploadError('Please select a valid video file (MP4, WebM, MOV, OGG).');
      return;
    }

    // 150MB limit
    if (file.size > 150 * 1024 * 1024) {
      setUploadError('Video file size exceeds 150MB limit. Please compress the video.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    const res = await uploadVideoFile(file);
    setIsUploading(false);

    if (res.success && res.url) {
      onChange(res.url);
    } else {
      setUploadError(res.message || 'Failed to upload video from folder.');
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>{label}</span>
          </label>
          {helperText && <p className="text-[11px] text-slate-400 font-light">{helperText}</p>}
        </div>

        <span className="text-[11px] font-semibold text-[#1F3A2E] bg-[#1F3A2E]/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
          <FolderOpen className="w-3 h-3 text-[#B58A5A]" />
          <span>Upload From Folder</span>
        </span>
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
                <p className="text-[11px] text-slate-400 font-light">
                  Supports MP4, WebM, MOV, OGG (up to 150MB)
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
            <p className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p>
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
                <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{value}</p>
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
