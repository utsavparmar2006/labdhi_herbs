'use me';
'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

interface DeleteUserModalProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteUserModal({
  userName,
  isOpen,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await onConfirm();
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to delete user account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EFE9DD] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#1A201C]">Delete Account?</h3>
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              Are you sure you want to permanently delete account <strong className="text-slate-800">{userName}</strong>?
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium text-left">
            ⚠️ This action cannot be undone. All saved preferences and order history linked to this account will be removed.
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-100 text-red-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-[#F8F6F0] border-t border-[#EFE9DD] flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#EFE9DD] hover:bg-white text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
