'use me';
'use client';

import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, ShieldCheck, Loader2 } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
}

interface EditUserModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedData: {
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
  }) => Promise<void>;
}

export default function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setRole(user.role || 'user');
      setStatus(user.status || 'active');
      setErrorMsg('');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await onSave({ name, email, phone, role, status });
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to update user profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EFE9DD] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif text-lg font-bold text-[#1A201C]">Edit User Account</h3>
            <p className="text-xs text-slate-500 font-light">Update profile & permission settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-slate-800 font-bold focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-slate-800 font-bold focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#EFE9DD] hover:bg-slate-100 text-slate-600 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white font-bold cursor-pointer shadow-md flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#D4A373]" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
