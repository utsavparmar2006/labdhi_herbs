'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, User, ChevronDown, LogOut, ShieldCheck } from 'lucide-react';

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
}

export default function AdminHeader({ onToggleMobileMenu, title = 'User Management' }: AdminHeaderProps) {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const saved = localStorage.getItem('user');

      if (!token || !saved) {
        router.push('/admin/login');
        return;
      }

      try {
        const parsed = JSON.parse(saved);
        if (parsed.role !== 'admin') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          router.push('/admin/login');
          return;
        }
        setAdminUser(parsed);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/admin/login');
      }
    }
  }, [router]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
    }
    router.push('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-[#EFE9DD] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg bg-[#F8F6F0] text-slate-700 hover:bg-[#EFE9DD] transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="space-y-0.5">
          <nav className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <span>Admin Panel</span>
            <span>/</span>
            <span className="text-[#1F3A2E] font-semibold">{title}</span>
          </nav>
          <h1 className="text-sm font-bold text-[#1A201C] font-serif hidden sm:block">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Notifications & Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-[#F8F6F0] text-slate-600 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B58A5A]" />
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F3A2E] text-white text-xs font-bold hover:bg-[#15271F] transition-all cursor-pointer shadow-xs"
          >
            <div className="w-6 h-6 rounded-full bg-[#D4A373] text-[#1F3A2E] flex items-center justify-center font-bold text-[10px]">
              {adminUser?.name ? adminUser.name[0].toUpperCase() : 'A'}
            </div>
            <span className="hidden sm:inline">{adminUser?.name || 'Administrator'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#D4A373]" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EFE9DD] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-[#EFE9DD] space-y-0.5">
                <p className="text-xs font-bold text-[#1F3A2E] truncate">{adminUser?.name || 'Labdhi Admin'}</p>
                <p className="text-[10px] text-slate-500 truncate">{adminUser?.email || 'admin@labdhiherbs.com'}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>Sign Out</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
