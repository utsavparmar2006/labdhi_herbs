'use me';
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import ImageFolderPicker from '../components/ImageFolderPicker';
import VideoFolderPicker from '../components/VideoFolderPicker';
import {
  getAdminSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  toggleStoryStatus,
  deleteSuccessStory,
  getCategories,
} from '../../../services/api';
import { SuccessStory, MainCategory } from '../../../types';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Star,
  Layers,
  Video,
  Film,
  MapPin,
  ShieldCheck,
  Quote,
  Eye,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  User,
  HeartHandshake,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryFormData {
  storyType: 'photo' | 'video';
  customer: string;
  location: string;
  title: string;
  formulation: string;
  productId: string;
  duration: string;
  rating: number;
  comment: string;
  beforeImage: string;
  afterImage: string;
  videoUrl: string;
  videoPoster: string;
  additionalVideos: { url: string; poster: string; label: string }[];
  featured: boolean;
  verified: boolean;
  status: 'active' | 'inactive';
  order: number;
  mainCategory: string;
  subCategory: string;
}

const EMPTY_FORM: StoryFormData = {
  storyType: 'photo',
  customer: '',
  location: 'Surat, Gujarat',
  title: '',
  formulation: 'Beautiction Face Pack',
  productId: '',
  duration: '4 Weeks Treatment',
  rating: 5,
  comment: '',
  beforeImage: '',
  afterImage: '',
  videoUrl: '',
  videoPoster: '',
  additionalVideos: [],
  featured: false,
  verified: true,
  status: 'active',
  order: 0,
  mainCategory: 'skin-face-care',
  subCategory: 'face-packs',
};

export default function AdminStoriesClient() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Tab State: 'photo' | 'video' | 'all'
  const [activeTab, setActiveTab] = useState<'photo' | 'video' | 'all'>('photo');

  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [stats, setStats] = useState({
    totalStories: 0,
    activeStories: 0,
    inactiveStories: 0,
    photoStories: 0,
    featuredStories: 0,
    videoStories: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'standard'>('all');
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [formData, setFormData] = useState<StoryFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch stories list from backend
  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    const res = await getAdminSuccessStories();
    if (res.success && Array.isArray(res.data)) {
      setStories(res.data);
      if (res.stats) {
        setStats({
          totalStories: res.stats.totalStories || 0,
          activeStories: res.stats.activeStories || 0,
          inactiveStories: res.stats.inactiveStories || 0,
          photoStories: res.stats.photoStories || 0,
          featuredStories: res.stats.featuredStories || 0,
          videoStories: res.stats.videoStories || 0,
        });
      }
    } else {
      showToast(res.message || 'Failed to load stories from server', 'error');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchStories();
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, [fetchStories]);

  // Filtered stories according to Active Tab & Search Filters
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // 1. Tab Format Filter
      const isVideoStory =
        story.storyType === 'video' ||
        Boolean(story.videoUrl && story.videoUrl.trim().length > 0);
      const isPhotoStory =
        story.storyType === 'photo' ||
        (!story.videoUrl && Boolean(story.beforeImage && story.afterImage));

      if (activeTab === 'photo' && !isPhotoStory) return false;
      if (activeTab === 'video' && !isVideoStory) return false;

      // 2. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        story.customer.toLowerCase().includes(q) ||
        story.title.toLowerCase().includes(q) ||
        story.formulation.toLowerCase().includes(q) ||
        story.location.toLowerCase().includes(q) ||
        story.comment.toLowerCase().includes(q);

      // 3. Status Filter
      const matchesStatus = statusFilter === 'all' || story.status === statusFilter;

      // 4. Featured Filter
      const matchesFeatured =
        featuredFilter === 'all' ||
        (featuredFilter === 'featured' && story.featured) ||
        (featuredFilter === 'standard' && !story.featured);

      // 5. Category Filter
      const matchesCategory =
        categoryFilter === 'all' ||
        story.mainCategory === categoryFilter ||
        story.mainCategory?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesFeatured && matchesCategory;
    });
  }, [stories, activeTab, searchQuery, statusFilter, featuredFilter, categoryFilter]);

  // Open Create Modal (Tailored to current tab or explicit type)
  const handleOpenCreate = (type?: 'photo' | 'video') => {
    const selectedType = type || (activeTab === 'video' ? 'video' : 'photo');
    setEditingStory(null);
    setFormData({
      ...EMPTY_FORM,
      storyType: selectedType,
      order: stories.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (story: SuccessStory) => {
    setEditingStory(story);
    const resolvedType: 'photo' | 'video' =
      story.storyType ||
      (story.videoUrl && story.videoUrl.trim().length > 0 ? 'video' : 'photo');

    setFormData({
      storyType: resolvedType,
      customer: story.customer,
      location: story.location || 'Surat, Gujarat',
      title: story.title,
      formulation: story.formulation,
      productId: story.productId || '',
      duration: story.duration || '4 Weeks Treatment',
      rating: story.rating || 5,
      comment: story.comment,
      beforeImage: story.beforeImage || '',
      afterImage: story.afterImage || '',
      videoUrl: story.videoUrl || '',
      videoPoster: story.videoPoster || '',
      additionalVideos: (story.additionalVideos || []).map((v) => ({
        url: v.url || '',
        poster: v.poster || '',
        label: v.label || '',
      })),
      featured: Boolean(story.featured),
      verified: story.verified !== false,
      status: story.status || 'active',
      order: story.order || 0,
      mainCategory: story.mainCategory || (categories[0]?.id || ''),
      subCategory: story.subCategory || '',
    });
    setIsModalOpen(true);
  };

  // Submit Story Form (Create / Update)
  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer.trim()) {
      showToast('Customer name is required', 'error');
      return;
    }
    if (!formData.title.trim()) {
      showToast('Story title is required', 'error');
      return;
    }
    if (!formData.formulation.trim()) {
      showToast('Formulation product name is required', 'error');
      return;
    }
    if (!formData.comment.trim()) {
      showToast('Customer testimonial quote is required', 'error');
      return;
    }

    // Specialized Validation based on Story Type
    if (formData.storyType === 'photo') {
      if (!formData.beforeImage.trim() || !formData.afterImage.trim()) {
        showToast(
          'Both Before and After photos are required for transformation photo stories',
          'error'
        );
        return;
      }
    } else if (formData.storyType === 'video') {
      if (!formData.videoUrl.trim()) {
        showToast('A video file or URL is required for customer video stories', 'error');
        return;
      }
    }

    setIsSaving(true);
    let res;
    if (editingStory) {
      res = await updateSuccessStory(editingStory.id, formData);
    } else {
      res = await createSuccessStory(formData);
    }
    setIsSaving(false);

    if (res.success) {
      showToast(
        editingStory
          ? 'Success story updated successfully!'
          : `${formData.storyType === 'video' ? 'Video story' : 'Before & After story'} added successfully!`
      );
      setIsModalOpen(false);
      fetchStories();
    } else {
      showToast(res.message || 'Failed to save success story', 'error');
    }
  };

  // Toggle Status
  const handleToggleStatus = async (story: SuccessStory) => {
    const res = await toggleStoryStatus(story.id);
    if (res.success) {
      showToast(`Story status set to ${res.data?.status || 'updated'}`);
      fetchStories();
    } else {
      showToast(res.message || 'Failed to update status', 'error');
    }
  };

  // Delete Story
  const handleDeleteStory = async (story: SuccessStory) => {
    if (
      !confirm(
        `Are you sure you want to delete the success story for "${story.customer}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const res = await deleteSuccessStory(story.id);
    if (res.success) {
      showToast('Success story deleted successfully');
      fetchStories();
    } else {
      showToast(res.message || 'Failed to delete story', 'error');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F6F0] overflow-hidden">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          title="Success Stories"
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Customer Proof & Testimonial CMS</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1A201C]">
                Customer Transformations & Stories
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Manage authentic customer journeys, before/after photography, and video testimonials.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/stories"
                target="_blank"
                className="p-3 rounded-2xl bg-white border border-[#EFE9DD] text-slate-600 hover:text-[#1F3A2E] hover:border-[#1F3A2E]/40 transition-colors shadow-xs cursor-pointer"
                title="View live stories page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <button
                onClick={fetchStories}
                className="p-3 rounded-2xl bg-white border border-[#EFE9DD] text-slate-600 hover:text-[#1F3A2E] hover:border-[#1F3A2E]/40 transition-colors shadow-xs cursor-pointer"
                title="Refresh stories"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Dynamic Add Buttons according to current tab */}
              {activeTab === 'photo' && (
                <button
                  onClick={() => handleOpenCreate('photo')}
                  className="px-5 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-[#EFE9DD] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4A373]" />
                  <span>Add Before & After</span>
                </button>
              )}

              {activeTab === 'video' && (
                <button
                  onClick={() => handleOpenCreate('video')}
                  className="px-5 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-[#EFE9DD] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D4A373]" />
                  <span>Add Video Story</span>
                </button>
              )}

              {activeTab === 'all' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreate('photo')}
                    className="px-4 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-[#EFE9DD] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>+ Photo Story</span>
                  </button>
                  <button
                    onClick={() => handleOpenCreate('video')}
                    className="px-4 py-3 rounded-2xl bg-[#D4A373] hover:bg-[#b88c5d] text-[#1F3A2E] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-[#1F3A2E]" />
                    <span>+ Video Story</span>
                  </button>
                </div>
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
                className={`p-4 rounded-2xl border flex items-center gap-3 shadow-md ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span className="text-xs font-semibold">{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#B58A5A] text-xs font-semibold">
                <span>Total Proofs</span>
                <Award className="w-4 h-4 text-[#B58A5A]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {stats.totalStories}
              </p>
              <p className="text-[11px] text-slate-400 font-light">All documented transformations</p>
            </div>

            <div
              onClick={() => setActiveTab('photo')}
              className={`p-5 rounded-2xl border shadow-xs space-y-1.5 cursor-pointer transition-all ${
                activeTab === 'photo'
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-white border-[#EFE9DD] hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>Before & After Photos</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
                {stats.photoStories}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Side-by-side photo proofs</p>
            </div>

            <div
              onClick={() => setActiveTab('video')}
              className={`p-5 rounded-2xl border shadow-xs space-y-1.5 cursor-pointer transition-all ${
                activeTab === 'video'
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-white border-[#EFE9DD] hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between text-indigo-600 text-xs font-semibold">
                <span>Customer Video Stories</span>
                <Video className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-indigo-700">
                {stats.videoStories}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Video journeys & reels</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>Active on Site</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
                {stats.activeStories}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Currently live to public</p>
            </div>
          </div>

          {/* DEDICATED FORMAT NAVIGATION TABS */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE9DD] pb-2">
            <div className="inline-flex p-1 rounded-2xl bg-[#EFE9DD]/60 border border-[#EFE9DD] gap-1">
              <button
                onClick={() => setActiveTab('photo')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'photo'
                    ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                    : 'text-slate-600 hover:text-[#1F3A2E] hover:bg-white/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Before & After Photos</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'photo'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {stats.photoStories}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                    : 'text-slate-600 hover:text-[#1F3A2E] hover:bg-white/60'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Customer Video Stories</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'video'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {stats.videoStories}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                    : 'text-slate-600 hover:text-[#1F3A2E] hover:bg-white/60'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>All Proofs</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {stats.totalStories}
                </span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-light">
              Showing <span className="font-bold text-slate-700">{filteredStories.length}</span>{' '}
              {activeTab === 'video'
                ? 'video journeys'
                : activeTab === 'photo'
                ? 'photo transformations'
                : 'stories'}
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'video'
                    ? 'Search video customer stories by name, title, formulation...'
                    : 'Search before/after transformations by customer name, title, formulation...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] bg-[#F8F6F0]/40 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-[#F8F6F0]/40 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-[#F8F6F0]/40 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              {/* Featured Filter */}
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-[#F8F6F0]/40 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
              >
                <option value="all">All Stories</option>
                <option value="featured">Featured Hero Only</option>
                <option value="standard">Standard Only</option>
              </select>
            </div>
          </div>

          {/* Stories List Display */}
          {isLoading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#EFE9DD] space-y-3">
              <div className="w-8 h-8 border-3 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading customer stories...</p>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#EFE9DD] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center mx-auto">
                {activeTab === 'video' ? (
                  <Video className="w-6 h-6 text-[#B58A5A]" />
                ) : (
                  <Layers className="w-6 h-6 text-[#B58A5A]" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                  {activeTab === 'video'
                    ? 'No Video Stories Found'
                    : 'No Before & After Transformations Found'}
                </h3>
                <p className="text-xs text-slate-500 font-light max-w-sm mx-auto">
                  {searchQuery
                    ? 'No stories matched your search query. Try clearing filters.'
                    : activeTab === 'video'
                    ? 'Upload customer video interviews or transformation reels to showcase natural healing results.'
                    : 'Add side-by-side Before and After photography to showcase visible recovery.'}
                </p>
              </div>
              <button
                onClick={() => handleOpenCreate(activeTab === 'video' ? 'video' : 'photo')}
                className="px-5 py-2.5 rounded-xl bg-[#1F3A2E] text-[#EFE9DD] text-xs font-bold shadow-xs hover:bg-[#15271F] transition-colors"
              >
                {activeTab === 'video' ? 'Add First Video Story' : 'Add First Before & After'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story) => {
                const isVideo =
                  story.storyType === 'video' ||
                  Boolean(story.videoUrl && story.videoUrl.trim().length > 0);

                return (
                  <div
                    key={story.id}
                    className="bg-white rounded-3xl border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    {/* Visual Media Header: Video vs Photo Transformation */}
                    {isVideo ? (
                      /* VIDEO CARD PREVIEW */
                      <div className="relative aspect-[16/10] bg-black overflow-hidden border-b border-[#EFE9DD]">
                        <img
                          src={
                            story.videoPoster ||
                            story.beforeImage ||
                            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800'
                          }
                          alt={story.title}
                          className="w-full h-full object-cover opacity-75 group-hover:scale-105 group-hover:opacity-90 transition-all duration-500"
                        />

                        {/* Center Play Overlay Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/40 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                            <Video className="w-5 h-5 text-[#D4A373]" />
                          </div>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F3A2E] text-[#D4A373] shadow-xs flex items-center gap-1 border border-[#D4A373]/30">
                            <Video className="w-3 h-3 text-[#D4A373]" />
                            <span>Video Journey</span>
                          </span>
                          {story.featured && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4A373] text-[#1F3A2E] shadow-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Hero Featured</span>
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <button
                            onClick={() => handleToggleStatus(story)}
                            title={`Click to set ${story.status === 'active' ? 'Inactive' : 'Active'}`}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-105 ${
                              story.status === 'active'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {story.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* PHOTO CARD PREVIEW (Before / After Split) */
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-[#EFE9DD] flex">
                        {/* Before Half */}
                        <div className="w-1/2 relative border-r border-white/40 overflow-hidden">
                          <img
                            src={story.beforeImage}
                            alt="Before"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                            }}
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                            Before
                          </span>
                        </div>

                        {/* After Half */}
                        <div className="w-1/2 relative overflow-hidden">
                          <img
                            src={story.afterImage}
                            alt="After"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800';
                            }}
                          />
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-emerald-800/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                            After
                          </span>
                        </div>

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F3A2E]/90 text-white shadow-xs flex items-center gap-1">
                            <Layers className="w-3 h-3 text-[#D4A373]" />
                            <span>Before & After</span>
                          </span>
                          {story.featured && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4A373] text-[#1F3A2E] shadow-xs flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Hero Featured</span>
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <button
                            onClick={() => handleToggleStatus(story)}
                            title={`Click to set ${story.status === 'active' ? 'Inactive' : 'Active'}`}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-105 ${
                              story.status === 'active'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {story.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Customer Info & Location */}
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-[#1A201C] flex items-center gap-1.5">
                              <span>{story.customer}</span>
                              {story.verified && (
                                <span title="Verified Buyer">
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-light flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#B58A5A]" />
                              <span>{story.location}</span>
                            </p>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-700 text-xs font-bold">
                            <Star className="w-3 h-3 fill-current text-amber-500" />
                            <span>{story.rating}.0</span>
                          </div>
                        </div>

                        {/* Transformation Title */}
                        <h3 className="font-serif text-base font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors line-clamp-1">
                          {story.title}
                        </h3>

                        {/* Formulation, Category & Duration Badges */}
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] font-semibold">
                            {story.formulation}
                          </span>
                          {story.mainCategory && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-[10px]">
                              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                              <span>
                                {categories.find((c) => c.id === story.mainCategory)?.name ||
                                  story.mainCategory}
                              </span>
                              {story.subCategory && (
                                <span className="text-emerald-600 font-normal">
                                  •{' '}
                                  {categories
                                    .find((c) => c.id === story.mainCategory)
                                    ?.subCategories.find((s) => s.id === story.subCategory)?.name ||
                                    story.subCategory}
                                </span>
                              )}
                            </span>
                          )}
                          {story.duration && (
                            <span className="text-slate-400 font-light flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{story.duration}</span>
                            </span>
                          )}
                        </div>

                        {/* Quote Comment */}
                        <div className="relative pl-3 border-l-2 border-[#D4A373]/50 py-0.5">
                          <p className="text-xs text-slate-600 font-serif italic line-clamp-3 leading-relaxed">
                            "{story.comment}"
                          </p>
                        </div>
                      </div>

                      {/* Bottom Actions */}
                      <div className="pt-3 border-t border-[#EFE9DD] flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 font-light">
                          Order #{story.order || 0}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(story)}
                            className="p-2 rounded-xl bg-[#F8F6F0] hover:bg-[#1F3A2E]/10 text-slate-700 hover:text-[#1F3A2E] transition-colors cursor-pointer"
                            title="Edit Story"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteStory(story)}
                            className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                            title="Delete Story"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* CREATE / EDIT SUCCESS STORY MODAL                                     */}
      {/* ===================================================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-[#EFE9DD] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-[#EFE9DD] flex items-center justify-between bg-[#1F3A2E] text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D4A373]/20 flex items-center justify-center">
                    {formData.storyType === 'video' ? (
                      <Video className="w-4 h-4 text-[#D4A373]" />
                    ) : (
                      <Layers className="w-4 h-4 text-[#D4A373]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#EFE9DD]">
                      {editingStory
                        ? formData.storyType === 'video'
                          ? 'Edit Customer Video Story'
                          : 'Edit Before & After Transformation'
                        : formData.storyType === 'video'
                        ? 'Add Customer Video Journey'
                        : 'Add Before & After Transformation'}
                    </h3>
                    <p className="text-[11px] text-emerald-200/80 font-light">
                      {formData.storyType === 'video'
                        ? 'Upload or choose recorded customer video testimonial, reel, and video poster'
                        : 'Capture Before and After photography proof showing visible natural results'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmitStory} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Format Toggle (Only shown when creating new story) */}
                {!editingStory && (
                  <div className="flex items-center p-1 bg-[#F8F6F0] rounded-2xl border border-[#EFE9DD]">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, storyType: 'photo' }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.storyType === 'photo'
                          ? 'bg-[#1F3A2E] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#1F3A2E]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Before & After Photos</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, storyType: 'video' }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.storyType === 'video'
                          ? 'bg-[#1F3A2E] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#1F3A2E]'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Customer Video Journey</span>
                    </button>
                  </div>
                )}

                {/* Section 1: Customer Identity */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <User className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>1. Customer Identity & Location</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Customer Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, customer: e.target.value }))
                        }
                        placeholder="e.g. Priya Patel"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Location / City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, location: e.target.value }))
                        }
                        placeholder="e.g. Surat, Gujarat"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verified}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, verified: e.target.checked }))
                      }
                      className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800">Verified Buyer Badge</span>
                      <p className="text-[11px] text-slate-400 font-light">
                        Displays green shield badge confirming authentic customer purchase
                      </p>
                    </div>
                  </label>
                </div>

                {/* Section 2: Transformation Focus */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>2. Story Overview & Testimonial</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Headline / Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder={
                        formData.storyType === 'video'
                          ? 'e.g. Priya Patel Hair Growth Journey with Ayurvedic Oil'
                          : 'e.g. Severe Hair Fall Controlled in 3 Weeks'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  {/* Category & Subcategory Selection Card */}
                  <div className="p-4 rounded-2xl bg-[#F8F6F0]/80 border border-[#EFE9DD] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1F3A2E] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>Product Category & Subcategory Assignment</span>
                        <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-light">
                        Determines storefront filtering by customers
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Main Category */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Main Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.mainCategory}
                          onChange={(e) => {
                            const newCat = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              mainCategory: newCat,
                              subCategory: '',
                            }));
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                        >
                          <option value="">Select Main Category...</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subcategory */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">
                          Subcategory (Optional)
                        </label>
                        <select
                          value={formData.subCategory}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, subCategory: e.target.value }))
                          }
                          disabled={!formData.mainCategory}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] disabled:opacity-50 disabled:bg-slate-100"
                        >
                          <option value="">
                            {!formData.mainCategory
                              ? 'Select main category first'
                              : 'All / General Formulation (No Subcategory)'}
                          </option>
                          {categories
                            .find(
                              (c) =>
                                c.id === formData.mainCategory ||
                                c.name.toLowerCase() === formData.mainCategory.toLowerCase()
                            )
                            ?.subCategories?.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Formulation Used <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.formulation}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, formulation: e.target.value }))
                        }
                        placeholder="e.g. Herbal Kesh Sanjivani Hair Oil"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Duration</label>
                      <input
                        type="text"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, duration: e.target.value }))
                        }
                        placeholder="e.g. 4 Weeks Treatment"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Star Rating (1 - 5)</label>
                      <select
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, rating: Number(e.target.value) }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                        <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                        <option value={3}>⭐⭐⭐ (3 Stars)</option>
                        <option value={2}>⭐⭐ (2 Stars)</option>
                        <option value={1}>⭐ (1 Star)</option>
                      </select>
                    </div>
                  </div>

                  {/* Testimonial Quote */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Customer Quote / Testimonial <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.comment}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, comment: e.target.value }))
                      }
                      placeholder="Enter the customer's personal experience, relief, and feedback in their own words..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>
                </div>

                {/* Section 3: SEPARATE UPLOAD FORM BASED ON STORY TYPE */}
                {formData.storyType === 'photo' ? (
                  /* ========================================================= */
                  /* BEFORE & AFTER PHOTO UPLOADER (PHOTO STORIES ONLY)        */
                  /* ========================================================= */
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                      <Layers className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>3. Before & After Photography</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Before Photo */}
                      <div className="p-4 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0]/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Before Photo <span className="text-red-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-light">Prior to use</span>
                        </div>
                        <ImageFolderPicker
                          value={formData.beforeImage}
                          onChange={(url) => setFormData((prev) => ({ ...prev, beforeImage: url }))}
                          label="Before Image"
                          helperText="Upload or choose photo showing condition before formulation."
                        />
                      </div>

                      {/* After Photo */}
                      <div className="p-4 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0]/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                            After Photo <span className="text-red-500">*</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">After treatment</span>
                        </div>
                        <ImageFolderPicker
                          value={formData.afterImage}
                          onChange={(url) => setFormData((prev) => ({ ...prev, afterImage: url }))}
                          label="After Image"
                          helperText="Upload or choose photo showing the successful recovery/glow."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ========================================================= */
                  /* VIDEO JOURNEY UPLOADER (VIDEO STORIES ONLY)               */
                  /* ========================================================= */
                  <div className="space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                      <Video className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>3. Customer Video Journey & Reel</span>
                    </h4>

                    {/* Main Video File Picker */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>Customer Video File (MP4/WebM/MOV) <span className="text-red-500">*</span></span>
                      </label>
                      <VideoFolderPicker
                        value={formData.videoUrl}
                        onChange={(url) => setFormData((prev) => ({ ...prev, videoUrl: url }))}
                        label="Customer Video Story"
                        helperText="Upload or choose customer video interview, testimonial, or transformation reel."
                      />
                    </div>

                    {/* Video Poster Thumbnail Picker */}
                    <div className="p-4 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Video Poster / Cover Image (Optional)
                        </span>
                        <span className="text-[10px] text-slate-400 font-light">Thumbnail preview</span>
                      </div>
                      <ImageFolderPicker
                        value={formData.videoPoster}
                        onChange={(url) => setFormData((prev) => ({ ...prev, videoPoster: url }))}
                        label="Video Poster Image"
                        helperText="Displays before the customer plays the video. If empty, a default cover is used."
                      />
                    </div>

                    {/* ── Additional Videos Section ─────────────────────── */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-[#B58A5A]" />
                          Additional Videos
                          <span className="ml-1 px-2 py-0.5 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-[10px] font-bold">
                            {formData.additionalVideos.length}
                          </span>
                        </h5>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              additionalVideos: [
                                ...prev.additionalVideos,
                                { url: '', poster: '', label: '' },
                              ],
                            }))
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold hover:bg-[#1F3A2E] hover:text-white transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          Add Another Video
                        </button>
                      </div>

                      {formData.additionalVideos.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-[#EFE9DD] bg-[#F8F6F0]/50 text-center">
                          <Film className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-[11px] text-slate-400">
                            Click &quot;Add Another Video&quot; to attach more video clips to this story.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {formData.additionalVideos.map((vid, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0]/60 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                  Video #{idx + 2}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      additionalVideos: prev.additionalVideos.filter(
                                        (_, i) => i !== idx
                                      ),
                                    }))
                                  }
                                  className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Label */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600">Label / Title</label>
                                <input
                                  type="text"
                                  value={vid.label}
                                  onChange={(e) =>
                                    setFormData((prev) => {
                                      const updated = [...prev.additionalVideos];
                                      updated[idx] = { ...updated[idx], label: e.target.value };
                                      return { ...prev, additionalVideos: updated };
                                    })
                                  }
                                  placeholder="e.g. Week 2 Progress Video"
                                  className="w-full px-3 py-2 rounded-lg border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] bg-white"
                                />
                              </div>

                              {/* Video file */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600">
                                  Video File <span className="text-red-500">*</span>
                                </label>
                                <VideoFolderPicker
                                  value={vid.url}
                                  onChange={(url) =>
                                    setFormData((prev) => {
                                      const updated = [...prev.additionalVideos];
                                      updated[idx] = { ...updated[idx], url };
                                      return { ...prev, additionalVideos: updated };
                                    })
                                  }
                                  label={`Video ${idx + 2}`}
                                  helperText="Upload or choose an additional video clip."
                                />
                              </div>

                              {/* Poster image */}
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-600">Cover / Poster Image (optional)</label>
                                <ImageFolderPicker
                                  value={vid.poster}
                                  onChange={(url) =>
                                    setFormData((prev) => {
                                      const updated = [...prev.additionalVideos];
                                      updated[idx] = { ...updated[idx], poster: url };
                                      return { ...prev, additionalVideos: updated };
                                    })
                                  }
                                  label={`Poster ${idx + 2}`}
                                  helperText="Thumbnail shown before the video plays."
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section 4: Status & Featured Spotlight */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>4. Visibility & Display Settings</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status === 'active'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.checked ? 'active' : 'inactive',
                          }))
                        }
                        className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Active on Website</span>
                        <p className="text-[11px] text-slate-400 font-light">
                          Visible in public transformation gallery
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Featured Hero Story</span>
                        <p className="text-[11px] text-slate-400 font-light">
                          Spotlighted in the top featured showcase
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-semibold text-slate-600 hover:bg-[#F8F6F0] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-[#EFE9DD] text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-[#D4A373]" />
                      <span>
                        {editingStory
                          ? 'Save Changes'
                          : formData.storyType === 'video'
                          ? 'Create Video Story'
                          : 'Create Transformation'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
