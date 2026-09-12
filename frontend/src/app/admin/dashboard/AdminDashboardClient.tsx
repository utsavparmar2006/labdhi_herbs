'use me';
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newThisMonth: number;
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || '';
    }
    return '';
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_BASE_URL}/v1/users/stats`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (res.status === 401 || res.status === 403) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          }
          router.push('/admin/login');
          return;
        }
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.data);
        }
      } catch (e) {
        // Ignore fetch errors
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] flex font-sans selection:bg-[#1F3A2E] selection:text-white">
      
      {/* Sidebar Component */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          title="Dashboard Overview"
        />

        {/* Dashboard Body */}
        <main className="p-4 sm:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Welcome Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#14261E] text-white relative overflow-hidden shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1F3A2E] via-[#14261E] to-[#0A140F] opacity-90" />
            
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Labdhi Herbs Admin Panel 2.0</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Welcome to Admin Operations
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/70 font-light max-w-lg">
                Manage registered user accounts, herbal inventory, customer orders, and store content metrics securely.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 shrink-0">
              <Link
                href="/admin/users"
                className="px-5 py-3 rounded-2xl bg-[#D4A373] hover:bg-[#c29263] text-[#1F3A2E] font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
              >
                <span>Manage Users</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-6 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
                <div className="w-9 h-9 rounded-xl bg-[#F8F6F0] text-[#1F3A2E] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-[#1F3A2E]">
                {isLoading ? '...' : stats ? stats.totalUsers : '1'}
              </p>
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live database count
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Accounts</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-emerald-700">
                {isLoading ? '...' : stats ? stats.activeUsers : '1'}
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Verified status
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Admins</span>
                <div className="w-9 h-9 rounded-xl bg-[#F8F6F0] text-[#B58A5A] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-[#B58A5A]">
                {isLoading ? '...' : stats ? stats.adminUsers : '1'}
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Authorized roles
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New This Month</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="font-serif text-2xl font-bold text-amber-700">
                {isLoading ? '...' : stats ? stats.newThisMonth : '1'}
              </p>
              <div className="text-[11px] text-slate-500 font-medium">
                Recent registrations
              </div>
            </div>

          </div>

          {/* Quick Action Navigation Grid */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#1A201C]">
              Admin Control Modules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Module 1: User Management */}
              <Link
                href="/admin/users"
                className="p-6 rounded-3xl bg-white border border-[#EFE9DD] hover:border-[#1F3A2E] shadow-xs hover:shadow-lg transition-all space-y-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#14261E] text-[#D4A373] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1A201C] group-hover:text-[#1F3A2E]">
                    User Management
                  </h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    View registered users, search accounts, edit roles, toggle active/inactive status, and manage security permissions.
                  </p>
                </div>
                <div className="text-xs font-bold text-[#1F3A2E] flex items-center gap-1">
                  <span>Open User Controls</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#D4A373]" />
                </div>
              </Link>

              {/* Module 2: Products */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] opacity-80 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] text-slate-600 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                    Formulation Products
                  </h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    Manage herbal product catalog, prices, stock levels, and botanical ingredient profiles.
                  </p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  Module Ready Next
                </span>
              </div>

              {/* Module 3: Orders */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] opacity-80 space-y-4 relative">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] text-slate-600 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                    Orders & Shipments
                  </h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">
                    Review customer orders, update dispatch status, track shipments, and generate invoices.
                  </p>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  Module Ready Next
                </span>
              </div>

            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
