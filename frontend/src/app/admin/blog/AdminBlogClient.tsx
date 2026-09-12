'use me';
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import ImageFolderPicker from '../components/ImageFolderPicker';
import {
  getAdminBlogPosts,
  createBlogPost,
  updateBlogPost,
  toggleBlogStatus,
  toggleBlogHomeStatus,
  deleteBlogPost,
} from '../../../services/api';
import { BlogPost } from '../../../types';
import {
  BookOpen,
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
  Calendar,
  Clock,
  User,
  Tag,
  Eye,
  FileText,
  SlidersHorizontal,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  readTime: string;
  date: string;
  featured: boolean;
  showOnHome: boolean;
  status: 'published' | 'draft';
  order: number;
  tagsString: string;
}

const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const DEFAULT_CATEGORIES = [
  'Hair Care',
  'Skin Care',
  'Muscle & Joint Care',
  'Ayurveda',
  'Wellness',
];

const EMPTY_FORM: BlogFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Skin Care',
  author: 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
  image: '',
  readTime: '4 min read',
  date: new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
  featured: false,
  showOnHome: true,
  status: 'published',
  order: 0,
  tagsString: 'Ayurveda, Herbal Care',
};

export default function AdminBlogClient() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    featuredBlogs: 0,
    categoriesCount: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'home' | 'published' | 'draft'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch blogs list from backend
  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    const res = await getAdminBlogPosts();
    if (res.success && Array.isArray(res.data)) {
      setBlogs(res.data);
      if (res.stats) {
        setStats(res.stats);
      }
    } else {
      showToast(res.message || 'Failed to load blog posts from server', 'error');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Derived category list from all existing articles
  const allCategories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    blogs.forEach((b) => {
      if (b.category && b.category.trim()) set.add(b.category.trim());
    });
    return Array.from(set);
  }, [blogs]);

  // Filtered blogs based on Category, Search & Status
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategoryTab === 'All' ||
        blog.category?.toLowerCase() === selectedCategoryTab.toLowerCase();

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        blog.title.toLowerCase().includes(q) ||
        blog.excerpt.toLowerCase().includes(q) ||
        (blog.content && blog.content.toLowerCase().includes(q)) ||
        blog.author.toLowerCase().includes(q) ||
        blog.category.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'home'
          ? (blog as any).showOnHome !== false
          : blog.status === statusFilter);

      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [blogs, selectedCategoryTab, searchQuery, statusFilter]);

  // Quick 1-Click Toggle for Homepage Journal Section
  const handleToggleHome = async (blog: BlogPost, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const blogId = blog.id || (blog as any)._id;
      const res = await toggleBlogHomeStatus(blogId);
      if (res.success) {
        showToast(
          res.message ||
            `Article ${res.data?.showOnHome ? 'is now shown in' : 'is now hidden from'} Homepage Journal`
        );
        fetchBlogs();
      } else {
        showToast(res.message || 'Failed to toggle homepage status', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating homepage status', 'error');
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      ...EMPTY_FORM,
      category: selectedCategoryTab !== 'All' ? selectedCategoryTab : 'Skin Care',
      order: blogs.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug || blog.id,
      excerpt: blog.excerpt,
      content: blog.content || '',
      category: blog.category || 'Skin Care',
      author: blog.author || 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
      image: blog.image || '',
      readTime: blog.readTime || '5 min read',
      date: blog.date || '',
      featured: Boolean(blog.featured),
      showOnHome: (blog as any).showOnHome !== false,
      status: blog.status || 'published',
      order: blog.order || 0,
      tagsString: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  // Auto-calculate read time when content changes
  const handleContentChange = (contentVal: string) => {
    const text = `${formData.excerpt} ${contentVal}`;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    setFormData((prev) => ({
      ...prev,
      content: contentVal,
      readTime: `${minutes} min read`,
    }));
  };

  // Submit Article Form (Create / Update)
  const handleSubmitBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      showToast('Article headline is required', 'error');
      return;
    }
    if (!formData.excerpt.trim()) {
      showToast('Short article excerpt is required', 'error');
      return;
    }
    if (!formData.image.trim()) {
      showToast('Cover image is required. Please upload or choose an image.', 'error');
      return;
    }

    const tagsArray = formData.tagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      category: formData.category.trim(),
      author: formData.author.trim(),
      image: formData.image.trim(),
      readTime: formData.readTime.trim(),
      date: formData.date.trim(),
      featured: Boolean(formData.featured),
      showOnHome: Boolean(formData.showOnHome),
      status: formData.status,
      order: Number(formData.order) || 0,
      tags: tagsArray,
    };

    setIsSaving(true);
    let res;
    if (editingBlog) {
      res = await updateBlogPost(editingBlog.id, payload);
    } else {
      res = await createBlogPost(payload);
    }
    setIsSaving(false);

    if (res.success) {
      showToast(
        editingBlog
          ? 'Journal article updated successfully!'
          : 'Journal article published successfully!'
      );
      setIsModalOpen(false);
      fetchBlogs();
    } else {
      showToast(res.message || 'Failed to save blog article', 'error');
    }
  };

  // Toggle Publish / Draft status
  const handleToggleStatus = async (blog: BlogPost) => {
    const res = await toggleBlogStatus(blog.id);
    if (res.success) {
      showToast(`Article status updated to ${res.data?.status || 'updated'}`);
      fetchBlogs();
    } else {
      showToast(res.message || 'Failed to toggle status', 'error');
    }
  };

  // Delete Article
  const handleDeleteBlog = async (blog: BlogPost) => {
    if (
      !confirm(
        `Are you sure you want to delete "${blog.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    const res = await deleteBlogPost(blog.id);
    if (res.success) {
      showToast('Article deleted successfully');
      fetchBlogs();
    } else {
      showToast(res.message || 'Failed to delete article', 'error');
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
          title="Blog & Journal CMS"
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Top Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Ayurvedic Wisdom & Editorial CMS</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1A201C]">
                The Herbal Journal & Articles
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Manage educational Ayurvedic routines, botanical guides, and customer wellness journals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/blog"
                target="_blank"
                className="p-3 rounded-2xl bg-white border border-[#EFE9DD] text-slate-600 hover:text-[#1F3A2E] hover:border-[#1F3A2E]/40 transition-colors shadow-xs cursor-pointer"
                title="View live journal page"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>

              <button
                onClick={fetchBlogs}
                className="p-3 rounded-2xl bg-white border border-[#EFE9DD] text-slate-600 hover:text-[#1F3A2E] hover:border-[#1F3A2E]/40 transition-colors shadow-xs cursor-pointer"
                title="Refresh articles"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-5 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-[#EFE9DD] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4A373]" />
                <span>Add New Article</span>
              </button>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#B58A5A] text-xs font-semibold">
                <span>Total Articles</span>
                <BookOpen className="w-4 h-4 text-[#B58A5A]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {stats.totalBlogs}
              </p>
              <p className="text-[11px] text-slate-400 font-light">All documented posts</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>Published on Site</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-emerald-700">
                {stats.publishedBlogs}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Live in public journal</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5 border-l-4 border-l-[#1F3A2E]">
              <div className="flex items-center justify-between text-[#1F3A2E] text-xs font-semibold">
                <span>Home Page Journal</span>
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F3A2E]">
                {blogs.filter((b) => (b as any).showOnHome !== false).length}
                <span className="text-xs font-sans font-normal text-slate-400"> / 4 active</span>
              </p>
              <p className="text-[11px] text-slate-400 font-light">Shown on Homepage</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-amber-600 text-xs font-semibold">
                <span>Draft Articles</span>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-700">
                {stats.draftBlogs}
              </p>
              <p className="text-[11px] text-slate-400 font-light">In editorial progress</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#B58A5A] text-xs font-semibold">
                <span>Featured Lead</span>
                <Sparkles className="w-4 h-4 text-[#B58A5A]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {stats.featuredBlogs}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Editorial hero stories</p>
            </div>
          </div>

          {/* Category Filter Pills Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFE9DD] pb-2">
            <div className="inline-flex p-1 rounded-2xl bg-[#EFE9DD]/60 border border-[#EFE9DD] gap-1 overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedCategoryTab('All')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategoryTab === 'All'
                    ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                    : 'text-slate-600 hover:text-[#1F3A2E] hover:bg-white/60'
                }`}
              >
                <span>All Articles ({blogs.length})</span>
              </button>

              {allCategories.map((cat) => {
                const count = blogs.filter(
                  (b) => b.category?.toLowerCase() === cat.toLowerCase()
                ).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategoryTab === cat
                        ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                        : 'text-slate-600 hover:text-[#1F3A2E] hover:bg-white/60'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] ${
                        selectedCategoryTab === cat
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-light">
              Showing <span className="font-bold text-slate-700">{filteredBlogs.length}</span> articles
            </div>
          </div>

          {/* Search & Status Filter Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, excerpt, content keywords, author, or category..."
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

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-[#F8F6F0]/40 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
              >
                <option value="all">All Publishing Status</option>
                <option value="home">★ Homepage Journal (Active Only)</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>
          </div>

          {/* Articles Grid List */}
          {isLoading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#EFE9DD] space-y-3">
              <div className="w-8 h-8 border-3 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading journal articles...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-[#EFE9DD] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6 text-[#B58A5A]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                  No Journal Articles Found
                </h3>
                <p className="text-xs text-slate-500 font-light max-w-sm mx-auto">
                  {searchQuery
                    ? 'No articles match your search criteria. Try clearing filters.'
                    : 'Start sharing natural Ayurvedic wisdom by publishing your first article.'}
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-[#1F3A2E] text-[#EFE9DD] text-xs font-bold shadow-xs hover:bg-[#15271F] transition-colors"
              >
                Add First Article
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="bg-white rounded-3xl border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Article Cover Image Header */}
                  <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden border-b border-[#EFE9DD]">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                      }}
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F3A2E] text-[#D4A373] shadow-xs">
                        {blog.category}
                      </span>
                      {blog.featured && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4A373] text-[#1F3A2E] shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Featured Lead</span>
                        </span>
                      )}
                      {(blog as any).showOnHome !== false ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1">
                          ★ Home Page
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-black/50 backdrop-blur-xs text-white/80 shadow-xs">
                          Hidden from Home
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <button
                        onClick={() => handleToggleStatus(blog)}
                        title={`Click to switch to ${blog.status === 'published' ? 'Draft' : 'Published'}`}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer transition-transform hover:scale-105 ${
                          blog.status === 'published'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {blog.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </div>

                    {/* Reading Time Badge */}
                    <div className="absolute bottom-2 right-2 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4A373]" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Date & Author */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#B58A5A]" />
                          <span>{blog.date}</span>
                        </span>
                        <span className="font-semibold text-slate-600 line-clamp-1 max-w-[50%]">
                          {blog.author}
                        </span>
                      </div>

                      {/* Headline */}
                      <h3 className="font-serif text-base font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors line-clamp-2 leading-snug">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-xs text-slate-600 font-light leading-relaxed line-clamp-3">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Bottom Actions */}
                    <div className="pt-3 border-t border-[#EFE9DD] flex items-center justify-between gap-2">
                      {/* 1-Click Homepage Journal Toggle Button */}
                      <button
                        onClick={(e) => handleToggleHome(blog, e)}
                        title={`Click to ${(blog as any).showOnHome !== false ? 'hide from' : 'show in'} Homepage Journal section`}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          (blog as any).showOnHome !== false
                            ? 'bg-[#1F3A2E]/5 border-[#1F3A2E]/20 text-[#1F3A2E] hover:bg-[#1F3A2E]/10'
                            : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            (blog as any).showOnHome !== false
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : 'bg-slate-300'
                          }`}
                        />
                        <span>{(blog as any).showOnHome !== false ? 'On Home Page' : 'Off Home'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-2 rounded-xl bg-[#F8F6F0] hover:bg-[#1F3A2E]/10 text-slate-700 hover:text-[#1F3A2E] transition-colors cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteBlog(blog)}
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================== */}
      {/* CREATE / EDIT ARTICLE MODAL                                           */}
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
                    <BookOpen className="w-4 h-4 text-[#D4A373]" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#EFE9DD]">
                      {editingBlog ? 'Edit Journal Article' : 'Publish New Journal Article'}
                    </h3>
                    <p className="text-[11px] text-emerald-200/80 font-light">
                      Create educational Ayurvedic content with cover imagery and full body reading
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
              <form onSubmit={handleSubmitBlog} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Section 1: Article Identity & Metadata */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <FileText className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>1. Headline & Editorial Info</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Article Title / Headline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                          slug: generateSlug(e.target.value),
                        }))
                      }
                      placeholder="e.g. The Ancient Secrets of Herbal Face Packs for Glowing Skin"
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
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                      }
                      placeholder="e.g. ancient-secrets-of-herbal-face-packs"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] font-mono bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      >
                        {allCategories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Author Name</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, author: e.target.value }))
                        }
                        placeholder="e.g. Dr. Labdhi Parmar (Ayurvedic Specialist)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Publication Date</label>
                      <input
                        type="text"
                        value={formData.date}
                        onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                        placeholder="e.g. August 24, 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Reading Time</label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, readTime: e.target.value }))
                        }
                        placeholder="e.g. 5 min read"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Cover Imagery */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <Layers className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>2. Cover Photography</span>
                  </h4>

                  <ImageFolderPicker
                    value={formData.image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    label="Article Cover Image"
                    helperText="Upload photo from your computer folder or drag & drop. Recommended ratio 16:10."
                  />
                </div>

                {/* Section 3: Article Content */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <FileText className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>3. Article Body & Content</span>
                  </h4>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Short Excerpt / Teaser <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                      }
                      placeholder="Brief 1-2 sentence overview of the article shown on cards and search results..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Full Article Body Content (Markdown supported)
                    </label>
                    <textarea
                      rows={8}
                      value={formData.content}
                      onChange={(e) => handleContentChange(e.target.value)}
                      placeholder="Write the complete educational article here. You can use markdown headings (###), bullet points, and numbered lists..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#B58A5A]" />
                      <span>Article Tags (Comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.tagsString}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tagsString: e.target.value }))
                      }
                      placeholder="e.g. Skin Care, Ayurveda, Glow, Routine"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                    />
                  </div>
                </div>

                {/* Section 4: Visibility & Featured Spotlight */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#B58A5A]" />
                    <span>4. Publishing Options</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.status === 'published'}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.checked ? 'published' : 'draft',
                          }))
                        }
                        className="w-4 h-4 mt-0.5 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Published Live</span>
                        <p className="text-[11px] text-slate-400 font-light mt-0.5">
                          Visible to reader visitors in public journal
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, featured: e.target.checked }))
                        }
                        className="w-4 h-4 mt-0.5 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800">Featured Lead Story</span>
                        <p className="text-[11px] text-slate-400 font-light mt-0.5">
                          Spotlighted at top with large editorial banner
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                      formData.showOnHome
                        ? 'bg-[#1F3A2E]/5 border-[#1F3A2E]/30'
                        : 'bg-[#F8F6F0] border-[#EFE9DD]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.showOnHome}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, showOnHome: e.target.checked }))
                        }
                        className="w-4 h-4 mt-0.5 rounded text-[#1F3A2E] focus:ring-[#1F3A2E]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">Show on Home Page</span>
                          {formData.showOnHome && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1F3A2E] text-[#D4A373]">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-light mt-0.5">
                          Display in the 4-card Wellness Journal section on homepage
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
                        <span>{editingBlog ? 'Save Changes' : 'Publish Article'}</span>
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
