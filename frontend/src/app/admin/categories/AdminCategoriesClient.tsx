'use me';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import ImageFolderPicker from '../components/ImageFolderPicker';
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../../../services/api';
import { MainCategory, SubCategory } from '../../../types';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  ImageIcon,
  Save,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface EnrichedSubCategory extends SubCategory {
  parentCategoryId: string;
  parentCategoryName: string;
  parentCategoryStatus?: string;
}

export default function AdminCategoriesClient() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ACTIVE TAB: 'main' or 'sub'
  const [activeTab, setActiveTab] = useState<'main' | 'sub'>('main');

  // Main Categories State
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
    totalSubCategories: 0,
  });

  // Sub-Categories State
  const [subCategories, setSubCategories] = useState<EnrichedSubCategory[]>([]);
  const [selectedParentFilter, setSelectedParentFilter] = useState<string>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  // --- TAB 1: MAIN CATEGORY MODAL STATES ---
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [editingMainCategory, setEditingMainCategory] = useState<MainCategory | null>(null);
  const [isSavingMain, setIsSavingMain] = useState(false);
  const [mainFormData, setMainFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'active' as 'active' | 'inactive',
    order: 0,
  });

  // --- TAB 2: SUB-CATEGORY MODAL STATES ---
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState<EnrichedSubCategory | null>(null);
  const [isSavingSub, setIsSavingSub] = useState(false);
  const [subFormData, setSubFormData] = useState({
    parentCategoryId: '',
    name: '',
    slug: '',
    image: '',
    description: '',
    itemCount: 0,
  });

  // Delete Modals
  const [deletingMainCat, setDeletingMainCat] = useState<MainCategory | null>(null);
  const [deletingSubCat, setDeletingSubCat] = useState<EnrichedSubCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Main Categories
  const fetchMainCategories = useCallback(async () => {
    const res = await getAdminCategories({
      search: activeTab === 'main' ? searchQuery : undefined,
      status: activeTab === 'main' ? statusFilter : undefined,
    });

    if (res.success && Array.isArray(res.data)) {
      setCategories(res.data);
      if (res.stats) {
        setStats(res.stats);
      }
    }
  }, [activeTab, searchQuery, statusFilter]);

  // Fetch Sub-Categories
  const fetchSubCategories = useCallback(async () => {
    const res = await getAllSubCategories();
    if (res.success && Array.isArray(res.data)) {
      setSubCategories(res.data);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchMainCategories(), fetchSubCategories()]);
    setIsLoading(false);
  }, [fetchMainCategories, fetchSubCategories]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ==========================================
  // TAB 1: MAIN CATEGORY ACTIONS
  // ==========================================
  const handleOpenCreateMain = () => {
    setEditingMainCategory(null);
    setMainFormData({
      name: '',
      slug: '',
      description: '',
      image:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      status: 'active',
      order: categories.length + 1,
    });
    setIsMainModalOpen(true);
  };

  const handleOpenEditMain = (cat: MainCategory) => {
    setEditingMainCategory(cat);
    setMainFormData({
      name: cat.name,
      slug: cat.id || cat.slug,
      description: cat.description || '',
      image: cat.image || '',
      status: cat.status || 'active',
      order: cat.order || 0,
    });
    setIsMainModalOpen(true);
  };

  const handleSubmitMainCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainFormData.name.trim()) {
      showToast('Main category name is required', 'error');
      return;
    }

    const payload = {
      name: mainFormData.name.trim(),
      slug: mainFormData.slug.trim() || generateSlug(mainFormData.name),
      description: mainFormData.description.trim(),
      image: mainFormData.image.trim(),
      status: mainFormData.status,
      order: Number(mainFormData.order) || 0,
    };

    setIsSavingMain(true);
    let res;
    if (editingMainCategory) {
      res = await updateCategory(editingMainCategory.id, payload);
    } else {
      res = await createCategory(payload);
    }
    setIsSavingMain(false);

    if (res.success) {
      showToast(
        editingMainCategory
          ? 'Main category updated successfully!'
          : 'Main category created successfully!'
      );
      setIsMainModalOpen(false);
      refreshAll();
    } else {
      showToast(res.message || 'Failed to save main category', 'error');
    }
  };

  const handleToggleMainStatus = async (cat: MainCategory) => {
    const res = await toggleCategoryStatus(cat.id);
    if (res.success) {
      showToast(res.message);
      refreshAll();
    } else {
      showToast(res.message || 'Failed to toggle status', 'error');
    }
  };

  const handleConfirmDeleteMain = async () => {
    if (!deletingMainCat) return;
    setIsDeleting(true);
    const res = await deleteCategory(deletingMainCat.id);
    setIsDeleting(false);
    if (res.success) {
      showToast('Main category deleted successfully');
      setDeletingMainCat(null);
      refreshAll();
    } else {
      showToast(res.message || 'Failed to delete main category', 'error');
    }
  };

  // ==========================================
  // TAB 2: SUB-CATEGORY ACTIONS
  // ==========================================
  const handleOpenCreateSub = (defaultParentId?: string) => {
    setEditingSubCategory(null);
    setSubFormData({
      parentCategoryId: defaultParentId || (categories[0]?.id || ''),
      name: '',
      slug: '',
      image:
        'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800',
      description: '',
      itemCount: 0,
    });
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (sub: EnrichedSubCategory) => {
    setEditingSubCategory(sub);
    setSubFormData({
      parentCategoryId: sub.parentCategoryId || sub.mainCategoryId,
      name: sub.name,
      slug: sub.id || sub.slug,
      image: sub.image || '',
      description: sub.description || '',
      itemCount: sub.itemCount || 0,
    });
    setIsSubModalOpen(true);
  };

  const handleSubmitSubCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name.trim()) {
      showToast('Sub-category name is required', 'error');
      return;
    }
    if (!subFormData.parentCategoryId) {
      showToast('Please select a parent main category', 'error');
      return;
    }

    const payload = {
      name: subFormData.name.trim(),
      slug: subFormData.slug.trim() || generateSlug(subFormData.name),
      image: subFormData.image.trim(),
      description: subFormData.description.trim(),
      itemCount: Number(subFormData.itemCount) || 0,
      newParentCategoryId: subFormData.parentCategoryId,
    };

    setIsSavingSub(true);
    let res;
    if (editingSubCategory) {
      res = await updateSubCategory(
        editingSubCategory.parentCategoryId || editingSubCategory.mainCategoryId,
        editingSubCategory.id,
        payload
      );
    } else {
      res = await createSubCategory(subFormData.parentCategoryId, payload);
    }
    setIsSavingSub(false);

    if (res.success) {
      showToast(
        editingSubCategory
          ? 'Sub-category updated successfully!'
          : 'Sub-category created successfully!'
      );
      setIsSubModalOpen(false);
      refreshAll();
    } else {
      showToast(res.message || 'Failed to save sub-category', 'error');
    }
  };

  const handleConfirmDeleteSub = async () => {
    if (!deletingSubCat) return;
    setIsDeleting(true);
    const res = await deleteSubCategory(
      deletingSubCat.parentCategoryId || deletingSubCat.mainCategoryId,
      deletingSubCat.id
    );
    setIsDeleting(false);
    if (res.success) {
      showToast('Sub-category deleted successfully');
      setDeletingSubCat(null);
      refreshAll();
    } else {
      showToast(res.message || 'Failed to delete sub-category', 'error');
    }
  };

  // Filtered SubCategories for Tab 2
  const filteredSubCategories = subCategories.filter((sc) => {
    const matchesSearch =
      !searchQuery ||
      sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sc.description && sc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesParent =
      selectedParentFilter === 'all' ||
      sc.parentCategoryId === selectedParentFilter ||
      sc.mainCategoryId === selectedParentFilter;

    return matchesSearch && matchesParent;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex font-sans text-[#1A201C]">
      
      {/* Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <AdminHeader onToggleMobileMenu={() => setMobileSidebarOpen(true)} title="Categories" />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Header & Create Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <FolderTree className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Categories Architecture</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1A201C]">
                Category Management
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Manage Main Categories and Sub-Categories in their own dedicated workspaces.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshAll}
                className="p-2.5 rounded-xl border border-[#EFE9DD] hover:bg-white text-slate-600 transition-colors cursor-pointer"
                title="Refresh All"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {activeTab === 'main' ? (
                <button
                  onClick={handleOpenCreateMain}
                  className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4A373]" />
                  <span>Create Main Category</span>
                </button>
              ) : (
                <button
                  onClick={() => handleOpenCreateSub()}
                  className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4A373]" />
                  <span>Create Sub-Category</span>
                </button>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-md ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Main Categories</span>
                <FolderTree className="w-4 h-4 text-[#1F3A2E]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {stats.totalCategories}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Root store collections</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>Active Collections</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-900">
                {stats.activeCategories}
              </p>
              <p className="text-[11px] text-emerald-600/80 font-light">Visible on storefront</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#B58A5A] text-xs font-semibold">
                <span>Total Sub-Categories</span>
                <Layers className="w-4 h-4 text-[#B58A5A]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {subCategories.length}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Under all main collections</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                <span>Inactive / Drafts</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-900">
                {stats.inactiveCategories}
              </p>
              <p className="text-[11px] text-amber-600/80 font-light">Hidden from storefront</p>
            </div>
          </div>

          {/* TWO DEDICATED SUB TABS */}
          <div className="flex items-center gap-3 border-b border-[#EFE9DD] pb-4">
            <button
              onClick={() => {
                setActiveTab('main');
                setSearchQuery('');
              }}
              className={`px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'main'
                  ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-[#EFE9DD]/50 border border-[#EFE9DD]'
              }`}
            >
              <FolderTree className="w-4 h-4 text-[#D4A373]" />
              <span>1. Main Category</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20">
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('sub');
                setSearchQuery('');
              }}
              className={`px-6 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === 'sub'
                  ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-[#EFE9DD]/50 border border-[#EFE9DD]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#D4A373]" />
              <span>2. Sub Category</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/20">
                {subCategories.length}
              </span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: MAIN CATEGORY WORKSPACE                                            */}
          {/* ========================================================================= */}
          {activeTab === 'main' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search main categories by name, slug..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] self-stretch sm:self-auto shrink-0">
                  {(['all', 'active', 'inactive'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#1F3A2E] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#1A201C]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Categories Grid */}
              {isLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#1F3A2E]/20 border-t-[#1F3A2E] rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading main categories...</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-[#EFE9DD] p-8 space-y-4">
                  <FolderTree className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-[#1A201C]">No Main Categories Found</h3>
                  <button
                    onClick={handleOpenCreateMain}
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#D4A373]" />
                    <span>Create Main Category</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {categories.map((cat) => (
                    <motion.div
                      key={cat.id || cat._id}
                      layout
                      className="bg-white rounded-3xl border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Banner Image */}
                      <div className="relative h-44 w-full bg-[#1F3A2E]/10 overflow-hidden group">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1F3A2E] text-[#D4A373]">
                            <ImageIcon className="w-8 h-8 opacity-60" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Status Toggle Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={() => handleToggleMainStatus(cat)}
                            className="cursor-pointer"
                            title="Toggle active status"
                          >
                            {cat.status === 'active' ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-slate-300 text-[11px] font-bold flex items-center gap-1 border border-white/20">
                                Inactive
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Title & Slug in Banner */}
                        <div className="absolute bottom-4 left-5 right-5 text-white">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] uppercase font-mono tracking-wider text-[#EFE9DD] mb-1">
                            <span>slug: /shop/{cat.id}</span>
                          </div>
                          <h3 className="font-serif text-xl font-bold leading-tight drop-shadow-sm">
                            {cat.name}
                          </h3>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-600 font-light line-clamp-2 leading-relaxed">
                          {cat.description || 'No description provided.'}
                        </p>

                        <div className="pt-2 border-t border-[#EFE9DD] flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-[#B58A5A]" />
                            <span>{cat.subCategories?.length || 0} Sub-categories</span>
                          </span>

                          <button
                            onClick={() => {
                              setSelectedParentFilter(cat.id);
                              setActiveTab('sub');
                            }}
                            className="text-[#1F3A2E] hover:text-[#B58A5A] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Manage its Sub-categories</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-[#EFE9DD] flex items-center justify-between gap-3">
                          <a
                            href={`/shop/${cat.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-slate-600 hover:text-[#1F3A2E] flex items-center gap-1 transition-colors"
                          >
                            <span>View on Shop</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditMain(cat)}
                              className="px-4 py-2 rounded-xl bg-[#F8F6F0] hover:bg-[#1F3A2E] text-slate-700 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-[#EFE9DD] transition-all cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => setDeletingMainCat(cat)}
                              className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Main Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: SUB-CATEGORY WORKSPACE                                             */}
          {/* ========================================================================= */}
          {activeTab === 'sub' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Sub-Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sub-categories by name or slug..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>

                {/* Filter by Parent Category */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-600 shrink-0">
                    Filter by Parent:
                  </span>
                  <select
                    value={selectedParentFilter}
                    onChange={(e) => setSelectedParentFilter(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer"
                  >
                    <option value="all">All Main Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Categories Cards / Grid */}
              {isLoading ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-[#1F3A2E]/20 border-t-[#1F3A2E] rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading sub-categories...</p>
                </div>
              ) : filteredSubCategories.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-3xl border border-[#EFE9DD] p-8 space-y-4">
                  <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-serif text-lg font-bold text-[#1A201C]">No Sub-Categories Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-light">
                    {searchQuery || selectedParentFilter !== 'all'
                      ? 'No sub-categories match your filter criteria.'
                      : 'Add your first sub-category under any main collection.'}
                  </p>
                  <button
                    onClick={() => handleOpenCreateSub()}
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#D4A373]" />
                    <span>Create Sub-Category</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredSubCategories.map((sub, idx) => (
                    <motion.div
                      key={sub.id || idx}
                      layout
                      className="bg-white rounded-3xl border border-[#EFE9DD] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Top Parent Category Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-[11px] font-bold">
                            <FolderTree className="w-3 h-3 text-[#B58A5A]" />
                            <span>{sub.parentCategoryName || sub.mainCategoryId}</span>
                          </span>

                          <span className="text-[10px] font-mono text-slate-400">
                            /{sub.id}
                          </span>
                        </div>

                        {/* Thumbnail & Title */}
                        <div className="flex items-start gap-3.5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#EFE9DD] bg-slate-100 shrink-0">
                            {sub.image ? (
                              <img
                                src={sub.image}
                                alt={sub.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-[#1F3A2E] text-[#D4A373]">
                                <ImageIcon className="w-5 h-5 opacity-70" />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-serif text-base font-bold text-[#1A201C] leading-snug">
                              {sub.name}
                            </h4>
                            <p className="text-xs text-slate-500 font-light line-clamp-2 leading-relaxed">
                              {sub.description || 'No description added yet.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#EFE9DD] flex items-center justify-between gap-2">
                        <a
                          href={`/shop/${sub.parentCategoryId}/${sub.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-slate-500 hover:text-[#1F3A2E] flex items-center gap-1 transition-colors"
                        >
                          <span>View on Shop</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditSub(sub)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#F8F6F0] hover:bg-[#1F3A2E] text-slate-700 hover:text-white text-xs font-bold flex items-center gap-1 border border-[#EFE9DD] transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingSubCat(sub)}
                            className="p-1.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Sub-Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT MAIN CATEGORY ONLY                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMainModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-[#EFE9DD] shadow-2xl my-8 overflow-hidden"
            >
              <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#F8F6F0]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A201C]">
                    {editingMainCategory ? `Edit Main Category` : 'Create Main Category'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Root collection displayed on the store homepage & shop menu.
                  </p>
                </div>
                <button
                  onClick={() => setIsMainModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitMainCategory} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mainFormData.name}
                    onChange={(e) =>
                      setMainFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }))
                    }
                    placeholder="e.g. Skin & Face Care"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      URL Slug / Identifier <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Auto-generated
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={mainFormData.slug}
                    onChange={(e) =>
                      setMainFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                    placeholder="e.g. skin-face-care"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] font-mono bg-slate-50/50"
                  />
                </div>

                {/* Industry-Standard Folder / File Image Picker */}
                <ImageFolderPicker
                  value={mainFormData.image}
                  onChange={(url) => setMainFormData((prev) => ({ ...prev, image: url }))}
                  label="Category Cover Photography"
                  helperText="Upload photo from your computer folder or drag & drop."
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={mainFormData.description}
                    onChange={(e) =>
                      setMainFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of formulations in this category..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={mainFormData.status}
                      onChange={(e) =>
                        setMainFormData((prev) => ({
                          ...prev,
                          status: e.target.value as 'active' | 'inactive',
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Draft)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Display Order</label>
                    <input
                      type="number"
                      value={mainFormData.order}
                      onChange={(e) =>
                        setMainFormData((prev) => ({ ...prev, order: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsMainModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingMain}
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingMain ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 text-[#D4A373]" />
                    )}
                    <span>{isSavingMain ? 'Saving...' : editingMainCategory ? 'Update Main Category' : 'Create Main Category'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT SUB-CATEGORY ONLY                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSubModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full border border-[#EFE9DD] shadow-2xl my-8 overflow-hidden"
            >
              <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#F8F6F0]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1A201C]">
                    {editingSubCategory ? `Edit Sub-Category` : 'Create Sub-Category'}
                  </h3>
                  <p className="text-xs text-slate-500 font-light mt-0.5">
                    Sub-category attached directly to a selected Parent Main Category.
                  </p>
                </div>
                <button
                  onClick={() => setIsSubModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitSubCategory} className="p-6 space-y-5">
                {/* Parent Category Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Parent Main Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={subFormData.parentCategoryId}
                    onChange={(e) =>
                      setSubFormData((prev) => ({ ...prev, parentCategoryId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a parent category...
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sub-Category Name & Slug */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Sub-Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subFormData.name}
                    onChange={(e) =>
                      setSubFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      }))
                    }
                    placeholder="e.g. Face Packs & Ubtan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      URL Slug / Identifier <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Auto-generated
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={subFormData.slug}
                    onChange={(e) =>
                      setSubFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                    placeholder="e.g. face-packs"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] font-mono bg-slate-50/50"
                  />
                </div>

                {/* Industry-Standard Folder / File Image Picker */}
                <ImageFolderPicker
                  value={subFormData.image}
                  onChange={(url) => setSubFormData((prev) => ({ ...prev, image: url }))}
                  label="Sub-Category Thumbnail Photography"
                  helperText="Upload photo from your computer folder or drag & drop."
                />

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={subFormData.description}
                    onChange={(e) =>
                      setSubFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of this sub-category..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />
                </div>

                <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingSub}
                    className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSub ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 text-[#D4A373]" />
                    )}
                    <span>{isSavingSub ? 'Saving...' : editingSubCategory ? 'Update Sub-Category' : 'Create Sub-Category'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODALS                                               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deletingMainCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full border border-[#EFE9DD] shadow-2xl p-6 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                  Delete Main Category &quot;{deletingMainCat.name}&quot;?
                </h3>
                <p className="text-xs text-slate-500 font-light">
                  This will remove the main collection and its associated sub-categories.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingMainCat(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteMain}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {deletingSubCat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full border border-[#EFE9DD] shadow-2xl p-6 space-y-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                  Delete Sub-Category &quot;{deletingSubCat.name}&quot;?
                </h3>
                <p className="text-xs text-slate-500 font-light">
                  This will remove this sub-category from {deletingSubCat.parentCategoryName}.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingSubCat(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDeleteSub}
                  disabled={isDeleting}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
