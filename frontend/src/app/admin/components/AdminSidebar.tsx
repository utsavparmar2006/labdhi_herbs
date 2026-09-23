'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import OriginalTransparentLogo from '../../../components/OriginalTransparentLogo';
import {
  LayoutDashboard,
  Users,
  Package,
  FolderTree,
  ShoppingBag,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Sparkles,
  Award,
  Tag,
  Star,
  MailCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Home Page CMS', href: '/admin/homepage', icon: Sparkles },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: FolderTree },
  { name: 'Product Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Discount Management', href: '/admin/discounts', icon: Tag },
  { name: 'Success Stories', href: '/admin/stories', icon: Award },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { name: 'Blog / Journal', href: '/admin/blog', icon: BookOpen },
  { name: 'Subscribers & Leads', href: '/admin/subscribers', icon: MailCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#14261E] text-white selection:bg-[#1F3A2E] selection:text-white">
      
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="bg-white px-2.5 py-1.5 rounded-xl shadow-xs border border-white/20 flex items-center justify-center shrink-0">
            <OriginalTransparentLogo className="h-8 w-auto" isDarkBackground={false} />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xs uppercase tracking-wider text-[#D4A373]">
              Admin Panel
            </span>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-200 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg bg-white/10 text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/admin/users' && pathname?.startsWith('/admin/users')) ||
            (item.href === '/admin/settings' && pathname?.startsWith('/admin/settings'));

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#1F3A2E] text-[#D4A373] border border-[#D4A373]/30 shadow-md'
                  : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#D4A373]' : 'text-emerald-300/80'}`} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding Badge */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-2 text-[11px] text-emerald-200/60 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
          {!isCollapsed && <span>Labdhi Herbs Admin v2.0</span>}
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-300 border-r border-[#EFE9DD] h-screen sticky top-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-xs h-full z-10 animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
