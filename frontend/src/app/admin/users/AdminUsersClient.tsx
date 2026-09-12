'use me';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import UserDetailsDrawer from '../components/UserDetailsDrawer';
import EditUserModal from '../components/EditUserModal';
import DeleteUserModal from '../components/DeleteUserModal';
import CreateUserModal from '../components/CreateUserModal';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  UserPlus,
  Search,
  Filter,
  RotateCcw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

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

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  onlineUsers?: number;
  newThisMonth: number;
}

interface PaginationData {
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminUsersClient() {
  const router = useRouter();
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState<UserStats | null>(null);

  // Users list state
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    totalUsers: 0,
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Selected User Modal/Drawer States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserForDrawer, setSelectedUserForDrawer] = useState<UserData | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserData | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<UserData | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Helper token getter
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || '';
    }
    return '';
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch summary stats
  const fetchStats = useCallback(async () => {
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
      // Ignore stats fetch errors
    }
  }, [router]);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: '10',
        search: debouncedSearch,
        role: roleFilter,
        status: statusFilter,
      });

      const res = await fetch(`${API_BASE_URL}/v1/users?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
        setIsLoading(false);
        router.push('/admin/login');
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load user records.');
      }

      setUsers(data.data.users || []);
      setPagination(data.data.pagination);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Unable to connect to user management service.');
    }
  }, [page, debouncedSearch, roleFilter, statusFilter, router]);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  // Handler: Toggle user status (active <-> inactive)
  const handleToggleStatus = async (userId: string) => {
    setActiveMenuId(null);
    try {
      const token = getAuthToken();
      const res = await fetch(`${API_BASE_URL}/v1/users/${userId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update user status.');
      }

      showToast(`User status updated to ${data.data.status}!`);
      fetchStats();
      fetchUsers();

      // Refresh drawer if viewing
      if (selectedUserForDrawer && selectedUserForDrawer._id === userId) {
        setSelectedUserForDrawer((prev) => prev ? { ...prev, status: data.data.status } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  // Handler: Create new user account
  const handleCreateUser = async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
  }) => {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create user account.');
    }

    showToast('New user account created successfully!');
    fetchStats();
    fetchUsers();
  };

  // Handler: Save edit user form
  const handleSaveEdit = async (updatedData: {
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive';
  }) => {
    if (!selectedUserForEdit) return;

    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/users/${selectedUserForEdit._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user profile.');
    }

    showToast('User account updated successfully!');
    fetchStats();
    fetchUsers();
  };

  // Handler: Confirm delete user account
  const handleConfirmDelete = async () => {
    if (!selectedUserForDelete) return;

    const token = getAuthToken();
    const res = await fetch(`${API_BASE_URL}/v1/users/${selectedUserForDelete._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete user account.');
    }

    showToast('User account deleted successfully!');
    fetchStats();
    fetchUsers();
  };

  // Handler: Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] flex font-sans selection:bg-[#1F3A2E] selection:text-white">
      
      {/* Sidebar Component */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          title="User Management"
        />

        {/* Page Content Body */}
        <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="p-4 rounded-2xl bg-[#14261E] text-white text-xs font-semibold flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
              <CheckCircle className="w-4 h-4 text-[#D4A373]" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Page Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                Users & Accounts
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-light mt-0.5">
                Manage registered users, track online status, review roles, and set access permissions.
              </p>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4 text-[#D4A373]" />
              <span>Add New User</span>
            </button>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                <p className="font-serif text-2xl font-bold text-[#1F3A2E]">
                  {stats ? stats.totalUsers : '...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] text-[#1F3A2E] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Online Now</span>
                <p className="font-serif text-2xl font-bold text-emerald-600">
                  {stats ? (stats.onlineUsers ?? 0) : '...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Users</span>
                <p className="font-serif text-2xl font-bold text-emerald-800">
                  {stats ? stats.activeUsers : '...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Inactive</span>
                <p className="font-serif text-2xl font-bold text-amber-700">
                  {stats ? stats.inactiveUsers : '...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex items-center justify-between col-span-2 lg:col-span-1">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Admins</span>
                <p className="font-serif text-2xl font-bold text-[#B58A5A]">
                  {stats ? stats.adminUsers : '...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] text-[#B58A5A] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

          </div>

          {/* Search & Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
            
            {/* Search Input Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/60 text-xs text-slate-800 focus:outline-none focus:border-[#1F3A2E] transition-all"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/60 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">Role: All</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/60 text-slate-700 font-semibold focus:outline-none"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Reset Filters */}
              {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-2 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] text-slate-600 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

            </div>

          </div>

          {/* User Data Table Card */}
          <div className="rounded-3xl bg-white border border-[#EFE9DD] shadow-xs overflow-hidden">
            
            {isLoading ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#1F3A2E] mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading user records from database...</p>
              </div>
            ) : error ? (
              <div className="p-16 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
                <button
                  onClick={() => fetchUsers()}
                  className="px-4 py-2 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold"
                >
                  Retry Loading
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-serif text-base font-bold text-slate-800">No users found</h3>
                <p className="text-xs text-slate-500 font-light max-w-sm mx-auto">
                  No accounts matched your current search filters. Try clearing your search parameters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold"
                >
                  Clear Search Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-[#F8F6F0] border-b border-[#EFE9DD] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">User</th>
                      <th className="py-3.5 px-6">Email</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Live Session</th>
                      <th className="py-3.5 px-6">Account Status</th>
                      <th className="py-3.5 px-6">Last Login</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>

                  {/* Table Rows */}
                  <tbody className="divide-y divide-[#EFE9DD] text-xs font-medium text-slate-800">
                    {users.map((u) => {
                      const initials = u.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <tr key={u._id} className="hover:bg-[#F8F6F0]/50 transition-colors group">
                          
                          {/* User Name & Initials */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-9 h-9 rounded-full bg-[#14261E] text-[#D4A373] font-bold font-serif text-xs flex items-center justify-center shrink-0 border border-[#D4A373]/30">
                                  {initials}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                  u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                                }`} title={u.isOnline ? 'Online Now' : 'Offline'} />
                              </div>
                              <div>
                                <p className="font-bold text-[#1A201C]">{u.name}</p>
                                {u.phone && <p className="text-[10px] text-slate-400 font-light">{u.phone}</p>}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-4 px-6 text-slate-600 truncate max-w-[180px]">
                            {u.email}
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-[#1F3A2E] text-[#D4A373]'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Live Session (Online/Offline) */}
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                              u.isOnline
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${u.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              {u.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </td>

                          {/* Account Status Badge */}
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {u.status}
                            </span>
                          </td>

                          {/* Last Login Time */}
                          <td className="py-4 px-6 text-slate-500 font-light">
                            {u.lastLoginAt
                              ? new Date(u.lastLoginAt).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Never'}
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-6 text-right relative">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={() => setActiveMenuId(activeMenuId === u._id ? null : u._id)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {/* Actions Dropdown Menu */}
                              {activeMenuId === u._id && (
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-[#EFE9DD] py-1.5 z-40 text-left font-medium animate-in fade-in zoom-in-95 duration-150">
                                  
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setSelectedUserForDrawer(u);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-[#F8F6F0] text-slate-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#1F3A2E]" />
                                    <span>View Profile</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleStatus(u._id)}
                                    className="w-full px-4 py-2 hover:bg-[#F8F6F0] text-slate-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    {u.status === 'active' ? (
                                      <>
                                        <UserX className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Deactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Activate</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setSelectedUserForEdit(u);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-[#F8F6F0] text-slate-700 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-[#B58A5A]" />
                                    <span>Edit User</span>
                                  </button>

                                  <div className="border-t border-[#EFE9DD] my-1" />

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setSelectedUserForDelete(u);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Account</span>
                                  </button>

                                </div>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!isLoading && users.length > 0 && (
              <div className="p-4 border-t border-[#EFE9DD] bg-[#F8F6F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  Showing <strong className="text-slate-900">{((pagination.currentPage - 1) * pagination.limit) + 1}</strong> to{' '}
                  <strong className="text-slate-900">{Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}</strong> of{' '}
                  <strong className="text-slate-900">{pagination.totalUsers}</strong> users
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1.5 rounded-xl border border-[#EFE9DD] bg-white hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <span className="px-3 py-1 font-bold text-slate-800">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>

                  <button
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1.5 rounded-xl border border-[#EFE9DD] bg-white hover:bg-slate-100 disabled:opacity-40 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>

        </main>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* User Details Slide-over Drawer */}
      <UserDetailsDrawer
        user={selectedUserForDrawer}
        isOpen={!!selectedUserForDrawer}
        onClose={() => setSelectedUserForDrawer(null)}
        onToggleStatus={handleToggleStatus}
        onEdit={(u) => setSelectedUserForEdit(u)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={selectedUserForEdit}
        isOpen={!!selectedUserForEdit}
        onClose={() => setSelectedUserForEdit(null)}
        onSave={handleSaveEdit}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        userName={selectedUserForDelete?.name || ''}
        isOpen={!!selectedUserForDelete}
        onClose={() => setSelectedUserForDelete(null)}
        onConfirm={handleConfirmDelete}
      />

    </div>
  );
}
