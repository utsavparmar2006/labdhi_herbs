'use me';
'use client';

import { useState } from 'react';
import { X, UserPlus, Mail, Phone, Lock, ShieldCheck, Loader2 } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
  }) => Promise<void>;
}

export default function CreateUserModal({ isOpen, onClose, onCreate }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await onCreate({ name, email, phone, password, role, status });
      setIsLoading(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Failed to create user account.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#EFE9DD] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#1A201C]">Add New User</h3>
              <p className="text-[11px] text-slate-500 font-light">Create a user or administrator account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          
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
              placeholder="e.g. Rahul Sharma"
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
              placeholder="rahul@example.com"
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

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase tracking-wider">Initial Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/50 text-slate-800 focus:outline-none focus:border-[#1F3A2E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
