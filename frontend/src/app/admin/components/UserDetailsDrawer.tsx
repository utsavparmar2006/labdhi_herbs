'use me';
'use client';

import { X, Mail, Phone, Calendar, ShieldCheck, UserCheck, UserX, Clock, Tag } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  isOnline?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

interface UserDetailsDrawerProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (userId: string) => void;
  onEdit: (user: UserData) => void;
}

export default function UserDetailsDrawer({
  user,
  isOpen,
  onClose,
  onToggleStatus,
  onEdit,
}: UserDetailsDrawerProps) {
  if (!isOpen || !user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col justify-between border-l border-[#EFE9DD] animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F3A2E] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#B58A5A]" />
            <span>User Account Profile</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto font-sans">
          
          {/* Avatar & Summary Card */}
          <div className="p-6 rounded-3xl bg-[#14261E] text-white space-y-4 shadow-lg text-center relative overflow-hidden">
            <div className="relative inline-block mx-auto">
              <div className="w-16 h-16 rounded-full bg-[#D4A373] text-[#1F3A2E] font-bold font-serif text-2xl flex items-center justify-center border-2 border-white shadow-md">
                {initials}
              </div>
              <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#14261E] ${
                user.isOnline ? 'bg-emerald-400' : 'bg-slate-400'
              }`} title={user.isOnline ? 'Online Now' : 'Offline'} />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-white">{user.name}</h3>
              <p className="text-xs text-emerald-100/70 font-light">{user.email}</p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-white/10 text-slate-300 border border-white/10'
              }`}>
                {user.isOnline ? '🟢 Online' : '⚪ Offline'}
              </span>

              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'admin' ? 'bg-[#D4A373] text-[#1F3A2E]' : 'bg-white/10 text-emerald-200'
              }`}>
                Role: {user.role}
              </span>

              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'
              }`}>
                {user.status}
              </span>
            </div>
          </div>

          {/* Account Details List */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-[#EFE9DD] pb-2">
              Account Information
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Mail className="w-4 h-4 text-[#1F3A2E]" />
                  <span>Email Address</span>
                </div>
                <span className="font-semibold text-slate-800">{user.email}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Phone className="w-4 h-4 text-[#1F3A2E]" />
                  <span>Phone Number</span>
                </div>
                <span className="font-semibold text-slate-800">{user.phone || 'Not Provided'}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Clock className="w-4 h-4 text-[#1F3A2E]" />
                  <span>Last Login</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not logged in yet'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Calendar className="w-4 h-4 text-[#1F3A2E]" />
                  <span>Registration Date</span>
                </div>
                <span className="font-semibold text-slate-800">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                <div className="flex items-center gap-2.5 text-slate-500">
                  <Tag className="w-4 h-4 text-[#1F3A2E]" />
                  <span>User ID</span>
                </div>
                <span className="font-mono text-[11px] text-slate-600 truncate max-w-[160px]">{user._id}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Action Controls Footer */}
        <div className="p-6 border-t border-[#EFE9DD] bg-[#F8F6F0] flex items-center gap-3">
          <button
            onClick={() => onToggleStatus(user._id)}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
              user.status === 'active'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {user.status === 'active' ? (
              <>
                <UserX className="w-4 h-4" />
                <span>Deactivate Access</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Activate Access</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="px-5 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Edit Profile
          </button>
        </div>

      </aside>
    </div>
  );
}
