'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import ImageFolderPicker from '../components/ImageFolderPicker';
import MultiImageFolderPicker from '../components/MultiImageFolderPicker';
import VideoFolderPicker from '../components/VideoFolderPicker';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductFeatured,
  getCategories,
} from '../../../services/api';
import { Product, MainCategory, SubCategory } from '../../../types';
import {
  Package,
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
  Tag,
  Star,
  Layers,
  ShoppingBag,
  IndianRupee,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  ChevronRight,
  ArrowUpDown,
  FileText,
  ListPlus,
  Info,
  Video,
  Film,
  Youtube,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatYouTubeEmbedUrl, isYouTubeUrl } from '../../../utils/youtube';

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface ProductFormData {
  name: string;
  slug: string;
  category: string;
  categoryId: string;
  mainCategory: string;
  subCategory: string;
  price: number | string;
  originalPrice: number | string;
  image: string;
  images: string[];
  hoverImage: string;
  videoUrl: string;
  howToUseVideoUrl: string;
  tag: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  usage: string;
  inStock: boolean;
  featured: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  slug: '',
  category: 'Skin & Face Care',
  categoryId: 'skin-face-care',
  mainCategory: 'Skin & Face Care',
  subCategory: 'Face Packs & Ubtan',
  price: '',
  originalPrice: '',
  image: '',
  images: [],
  hoverImage: '',
  videoUrl: '',
  howToUseVideoUrl: '',
  tag: '',
  description: '',
  benefits: [],
  ingredients: [],
  usage: '',
  inStock: true,
  featured: false,
};

export default function AdminProductsClient() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'instock' | 'outofstock' | 'homepage'>('all');

  // Modal & Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // Benefit and Ingredient chip inputs
  const [newBenefitInput, setNewBenefitInput] = useState('');
  const [newIngredientInput, setNewIngredientInput] = useState('');

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch all products from API
  const fetchProductsList = useCallback(async () => {
    setIsLoading(true);
    const res = await getProducts({ limit: 100 });
    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    }
    setIsLoading(false);
  }, []);

  // Fetch categories for dropdowns
  const fetchCategoriesList = useCallback(async () => {
    const res = await getCategories();
    if (Array.isArray(res)) {
      setCategories(res);
    }
  }, []);

  useEffect(() => {
    fetchProductsList();
    fetchCategoriesList();
  }, [fetchProductsList, fetchCategoriesList]);

  // Derived available sub-categories based on selected mainCategory in form
  const availableSubCategories = useMemo(() => {
    const selectedCat = categories.find(
      (c) =>
        c.name.toLowerCase() === formData.mainCategory.toLowerCase() ||
        c.id.toLowerCase() === formData.mainCategory.toLowerCase()
    );
    return selectedCat?.subCategories || [];
  }, [categories, formData.mainCategory]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategoryFilter === 'all' ||
        p.category?.toLowerCase() === selectedCategoryFilter.toLowerCase() ||
        p.mainCategory?.toLowerCase() === selectedCategoryFilter.toLowerCase();

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'instock' && p.inStock !== false) ||
        (stockFilter === 'outofstock' && p.inStock === false) ||
        (stockFilter === 'homepage' && (p as any).featured === true);

      return matchesSearch && matchesCat && matchesStock;
    });
  }, [products, searchQuery, selectedCategoryFilter, stockFilter]);

  // Quick 1-Click Toggle for Home Page Showcase
  const handleToggleFeatured = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await toggleProductFeatured(product.id);
      if (res.success) {
        showToast(
          res.message ||
            `Product ${res.data?.featured ? 'is now shown in' : 'is now hidden from'} Homepage Showcase`
        );
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, featured: res.data?.featured ?? !p.featured } : p
          )
        );
      } else {
        showToast(res.message || 'Failed to toggle homepage showcase status', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating homepage status', 'error');
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    const defaultCat = categories[0]?.name || 'Skin & Face Care';
    const defaultSub = categories[0]?.subCategories?.[0]?.name || 'Face Packs & Ubtan';
    setFormData({
      ...EMPTY_FORM,
      mainCategory: defaultCat,
      category: defaultCat,
      categoryId: generateSlug(defaultCat),
      subCategory: defaultSub,
    });
    setNewBenefitInput('');
    setNewIngredientInput('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    const initialImages =
      prod.images && prod.images.length > 0
        ? prod.images
        : prod.image
        ? [prod.image]
        : [];

    setFormData({
      name: prod.name,
      slug: prod.id,
      category: prod.category || prod.mainCategory || 'Herbal Care',
      categoryId: prod.categoryId || generateSlug(prod.category || 'herbal-care'),
      mainCategory: prod.mainCategory || prod.category || 'Skin & Face Care',
      subCategory: prod.subCategory || 'Herbal Formulations',
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      image: prod.image || initialImages[0] || '',
      images: initialImages,
      hoverImage: prod.hoverImage || initialImages[1] || '',
      videoUrl: prod.videoUrl || '',
      howToUseVideoUrl: prod.howToUseVideoUrl || '',
      tag: prod.tag || '',
      description: prod.description || '',
      benefits: prod.benefits || [],
      ingredients: prod.ingredients || [],
      usage: prod.usage || '',
      inStock: prod.inStock !== false,
      featured: (prod as any).featured || false,
    });
    setNewBenefitInput('');
    setNewIngredientInput('');
    setIsModalOpen(true);
  };

  // Benefit List Management
  const handleAddBenefit = () => {
    if (newBenefitInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefitInput.trim()],
      }));
      setNewBenefitInput('');
    }
  };

  const handleRemoveBenefit = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== idx),
    }));
  };

  // Ingredient List Management
  const handleAddIngredient = () => {
    if (newIngredientInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, newIngredientInput.trim()],
      }));
      setNewIngredientInput('');
    }
  };

  const handleRemoveIngredient = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx),
    }));
  };

  // Submit Product Form (Create / Update)
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Product name is required', 'error');
      return;
    }
    if (!formData.price) {
      showToast('Valid product price is required', 'error');
      return;
    }
    const resolvedImages =
      formData.images.length > 0
        ? formData.images
        : formData.image
        ? [formData.image]
        : [];

    const primaryImage = resolvedImages[0] || formData.image.trim();

    if (!primaryImage) {
      showToast(
        'Product cover photography is required. Please choose photos from your folder.',
        'error'
      );
      return;
    }

    const payload = {
      id: formData.slug.trim() || generateSlug(formData.name),
      name: formData.name.trim(),
      category: formData.mainCategory,
      categoryId: generateSlug(formData.mainCategory),
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : 0,
      image: primaryImage,
      images: resolvedImages,
      hoverImage: resolvedImages[1] || formData.hoverImage.trim() || primaryImage,
      videoUrl: formData.videoUrl.trim(),
      howToUseVideoUrl: formData.howToUseVideoUrl.trim(),
      tag: formData.tag.trim(),
      description: formData.description.trim(),
      benefits: formData.benefits,
      ingredients: formData.ingredients,
      usage: formData.usage.trim(),
      inStock: formData.inStock,
      featured: formData.featured,
    };

    setIsSaving(true);
    let res;
    if (editingProduct) {
      res = await updateProduct(editingProduct.id, payload);
    } else {
      res = await createProduct(payload);
    }
    setIsSaving(false);

    if (res.success) {
      showToast(
        editingProduct ? 'Product updated successfully!' : 'Product added successfully!'
      );
      setIsModalOpen(false);
      fetchProductsList();
    } else {
      showToast(res.message || 'Failed to save product', 'error');
    }
  };

  // Delete Product Action
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    const res = await deleteProduct(deletingProduct.id);
    setIsDeleting(false);

    if (res.success) {
      showToast('Product removed from catalog');
      setDeletingProduct(null);
      fetchProductsList();
    } else {
      showToast(res.message || 'Failed to delete product', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex font-sans text-[#1A201C]">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onToggleMobileMenu={() => setMobileSidebarOpen(true)} title="Products" />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header & Primary Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <Package className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Catalog Inventory</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1A201C]">
                Product Management
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Add, organize, and manage authentic Ayurvedic formulations and retail stock.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchProductsList}
                className="p-3 rounded-2xl bg-white border border-[#EFE9DD] text-slate-600 hover:text-[#1F3A2E] hover:border-[#1F3A2E]/40 transition-colors shadow-xs cursor-pointer"
                title="Refresh product list"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleOpenCreate}
                className="px-5 py-3 rounded-2xl bg-[#1F3A2E] hover:bg-[#15271F] text-[#EFE9DD] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4A373]" />
                <span>Add New Product</span>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#B58A5A] text-xs font-semibold">
                <span>Total Formulations</span>
                <Package className="w-4 h-4 text-[#B58A5A]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {products.length}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Products in catalog</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>In Stock & Ready</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {products.filter((p) => p.inStock !== false).length}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Available for immediate dispatch</p>
            </div>

            <div
              onClick={() => setStockFilter(stockFilter === 'homepage' ? 'all' : 'homepage')}
              className={`p-5 rounded-2xl border shadow-xs space-y-1.5 cursor-pointer transition-all ${
                stockFilter === 'homepage'
                  ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-white border-[#EFE9DD] hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-amber-700 text-xs font-semibold">
                <span>Home Page Showcase</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {products.filter((p) => (p as any).featured).length}
              </p>
              <p className="text-[11px] text-slate-400 font-light">
                {stockFilter === 'homepage' ? 'Active filter applied • Click to reset' : 'Live on homepage 3-col showcase'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[#1F3A2E] text-xs font-semibold">
                <span>Active Categories</span>
                <Layers className="w-4 h-4 text-[#1F3A2E]" />
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                {categories.length}
              </p>
              <p className="text-[11px] text-slate-400 font-light">Assigned collections</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, slug, herb ingredients..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Stock & Home Filter Pills */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD]">
                {(['all', 'homepage', 'instock', 'outofstock'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStockFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-all cursor-pointer ${
                      stockFilter === st
                        ? st === 'homepage'
                          ? 'bg-[#B58A5A] text-white shadow-xs'
                          : 'bg-[#1F3A2E] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'all'
                      ? 'All'
                      : st === 'homepage'
                      ? '★ Home Showcase'
                      : st === 'instock'
                      ? 'In Stock'
                      : 'Out'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#1F3A2E]/20 border-t-[#1F3A2E] rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading catalog formulations...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#EFE9DD] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#1F3A2E]/5 text-[#1F3A2E] flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-[#B58A5A]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#1A201C]">No Products Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || selectedCategoryFilter !== 'all'
                    ? 'No items match your filter criteria. Try adjusting your search query.'
                    : 'Start building your store catalog by adding your first herbal formulation.'}
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#D4A373]" />
                <span>Add New Product</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const discount =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                      )
                    : 0;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-3xl border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                  >
                    {/* Top Image Preview */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                        }}
                      />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {product.tag && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1F3A2E] text-white shadow-xs">
                            {product.tag}
                          </span>
                        )}
                        {(product as any).featured && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4A373] text-[#1F3A2E] shadow-xs flex items-center gap-1 font-sans">
                            <Sparkles className="w-3 h-3 text-[#1F3A2E]" />
                            <span>Home Showcase</span>
                          </span>
                        )}
                        {discount > 0 && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                            {discount}% OFF
                          </span>
                        )}
                        {product.videoUrl && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#B58A5A] text-white shadow-xs flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>Video</span>
                          </span>
                        )}
                        {product.howToUseVideoUrl && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs flex items-center gap-1">
                            <Youtube className="w-3 h-3" />
                            <span>How-To Video</span>
                          </span>
                        )}
                      </div>

                      {/* Stock Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs ${
                            product.inStock !== false
                              ? 'bg-emerald-500/90 text-white backdrop-blur-xs'
                              : 'bg-red-500/90 text-white backdrop-blur-xs'
                          }`}
                        >
                          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        {/* Category & SubCategory */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-[#B58A5A] uppercase tracking-wider">
                            {product.mainCategory || product.category}
                          </span>
                          {product.subCategory && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] text-slate-500">
                                {product.subCategory}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-serif text-lg font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors line-clamp-1">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 font-light">
                          {product.description || 'Authentic herbal Ayurvedic formulation.'}
                        </p>
                      </div>

                      {/* Pricing & Footer Actions */}
                      <div className="pt-3 border-t border-[#EFE9DD] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-[#1F3A2E]">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/product/${product.id}`}
                            target="_blank"
                            className="text-[11px] font-bold text-[#B58A5A] hover:underline flex items-center gap-1"
                          >
                            <span>Live Page</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Quick 1-Click Toggle for Homepage Section */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFeatured(product, e)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer border ${
                            (product as any).featured
                              ? 'bg-emerald-50 text-[#1F3A2E] border-emerald-300 hover:bg-emerald-100 shadow-2xs'
                              : 'bg-[#F8F6F0] text-slate-500 border-[#EFE9DD] hover:bg-slate-100 hover:text-slate-800'
                          }`}
                          title={(product as any).featured ? 'Click to remove from Homepage Showcase' : 'Click to display on Homepage Showcase'}
                        >
                          <span className="flex items-center gap-1.5">
                            <Sparkles className={`w-3.5 h-3.5 ${(product as any).featured ? 'text-[#B58A5A]' : 'text-slate-400'}`} />
                            <span className="text-[11px]">Homepage Showcase:</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                            (product as any).featured
                              ? 'bg-[#1F3A2E] text-[#D4A373]'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {(product as any).featured ? 'ON (VISIBLE)' : 'OFF'}
                          </span>
                        </button>

                        {/* Card Edit & Delete Buttons */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="flex-1 py-2 rounded-xl bg-[#F8F6F0] hover:bg-[#1F3A2E] text-[#1F3A2E] hover:text-white border border-[#EFE9DD] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* CREATE / EDIT PRODUCT MODAL                                               */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="bg-white rounded-3xl border border-[#EFE9DD] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col my-8 overflow-hidden"
                >
                  {/* Modal Header */}
                  <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#F8F6F0]">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B58A5A] uppercase tracking-wider mb-1">
                        <Package className="w-3.5 h-3.5" />
                        <span>
                          {editingProduct ? 'Update Formulation' : 'Create New Product'}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#1A201C]">
                        {editingProduct ? editingProduct.name : 'Add New Ayurvedic Formulation'}
                      </h3>
                      <p className="text-xs text-slate-500 font-light">
                        Fill in formulation details, upload cover image from your computer folder, and save.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Form Content */}
                  <form
                    onSubmit={handleSubmitProduct}
                    className="p-6 overflow-y-auto space-y-6 flex-1"
                  >
                    {/* Section 1: Basic Identification */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                        <Info className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>1. Basic Information</span>
                      </h4>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              name: e.target.value,
                              slug: generateSlug(e.target.value),
                            }))
                          }
                          placeholder="e.g. Beautiction Face Pack (Regular Pack)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              setFormData((prev) => ({
                                ...prev,
                                slug: generateSlug(e.target.value),
                              }))
                            }
                            placeholder="e.g. beautiction-face-pack"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] font-mono bg-slate-50/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Marketing Tag Badge
                          </label>
                          <input
                            type="text"
                            value={formData.tag}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, tag: e.target.value }))
                            }
                            placeholder="e.g. Bestseller, Trending, 100% Ayurvedic"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Categorization */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                        <Layers className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>2. Categorization</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Main Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            required
                            value={formData.mainCategory}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              const selected = categories.find((c) => c.name === newCat);
                              const firstSub = selected?.subCategories?.[0]?.name || '';
                              setFormData((prev) => ({
                                ...prev,
                                mainCategory: newCat,
                                category: newCat,
                                categoryId: generateSlug(newCat),
                                subCategory: firstSub,
                              }));
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer"
                          >
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Sub-Category</label>
                          <select
                            value={formData.subCategory}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, subCategory: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] cursor-pointer"
                          >
                            <option value="">None / Direct Collection</option>
                            {availableSubCategories.map((sub) => (
                              <option key={sub.id} value={sub.name}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Pricing, Inventory & Highlights */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                        <IndianRupee className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>3. Pricing & Inventory</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Selling Price (₹) <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="1"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, price: e.target.value }))
                            }
                            placeholder="e.g. 349"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Original MRP (₹) <span className="text-slate-400 font-light">(Strike-through)</span>
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={formData.originalPrice}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))
                            }
                            placeholder="e.g. 499"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        {/* In Stock Checkbox Card */}
                        <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] cursor-pointer hover:bg-[#F3EFE6] transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.inStock}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, inStock: e.target.checked }))
                            }
                            className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800">In Stock (Available for Purchase)</span>
                            <p className="text-[11px] text-slate-400 font-light">
                              When enabled, customers can add this product to their cart and checkout
                            </p>
                          </div>
                        </label>

                        {/* Dedicated Homepage Showcase Toggle Switch Card */}
                        <div
                          className={`p-4 rounded-2xl border transition-all duration-300 ${
                            formData.featured
                              ? 'bg-gradient-to-r from-emerald-50 via-[#F8F6F0] to-amber-50/60 border-emerald-300 shadow-xs'
                              : 'bg-[#F8F6F0] border-[#EFE9DD]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Sparkles className={`w-4 h-4 ${formData.featured ? 'text-[#B58A5A]' : 'text-slate-400'}`} />
                                <span className="text-xs font-bold text-slate-900">
                                  Show in Handcrafted Herbal Remedies Section (Home Page)
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                    formData.featured
                                      ? 'bg-[#1F3A2E] text-[#D4A373] shadow-xs'
                                      : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {formData.featured ? '✓ ACTIVE ON HOMEPAGE' : 'HIDDEN FROM HOMEPAGE'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                                Toggle ON to feature this formulation in the 3-column auto-scrolling showcase on the homepage.
                              </p>
                            </div>

                            {/* Prominent Sliding Toggle Switch */}
                            <button
                              type="button"
                              role="switch"
                              aria-checked={formData.featured}
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, featured: !prev.featured }))
                              }
                              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] shadow-inner ${
                                formData.featured ? 'bg-[#1F3A2E]' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out flex items-center justify-center text-[10px] font-bold ${
                                  formData.featured
                                    ? 'translate-x-8 text-[#1F3A2E]'
                                    : 'translate-x-0 text-slate-400'
                                }`}
                              >
                                {formData.featured ? '✓' : '✕'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Industry-Standard Multi-Image Upload */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                        <Package className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>4. Product Photography (Multiple Photos)</span>
                      </h4>

                      <MultiImageFolderPicker
                        images={formData.images}
                        onChange={(newImages) =>
                          setFormData((prev) => ({
                            ...prev,
                            images: newImages,
                            image: newImages[0] || '',
                            hoverImage: newImages[1] || newImages[0] || '',
                          }))
                        }
                        label="Product Photography Set"
                        helperText="Select or drag & drop multiple photos from your folder. The 1st photo with the gold badge is your main cover; additional photos appear in the product page gallery."
                        maxImages={8}
                      />

                      {/* Video Demonstration Picker */}
                      <div className="pt-4 border-t border-[#EFE9DD]">
                        <VideoFolderPicker
                          value={formData.videoUrl}
                          onChange={(url) => setFormData((prev) => ({ ...prev, videoUrl: url }))}
                          label="Product Video Demonstration (Optional)"
                          helperText="Upload or choose an MP4, WebM, or MOV video showcasing product application, texture, unboxing, or customer review."
                        />
                      </div>
                    </div>

                    {/* Section 5: Botanical Details & Editorial */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F3A2E] flex items-center gap-1.5 border-b border-[#EFE9DD] pb-2">
                        <FileText className="w-3.5 h-3.5 text-[#B58A5A]" />
                        <span>5. Herbal Details & Usage</span>
                      </h4>

                      {/* Description */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Product Description</label>
                        <textarea
                          rows={3}
                          value={formData.description}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                          }
                          placeholder="Authentic botanical formulation handcrafted with 100% natural herbs..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                        />
                      </div>

                      {/* Key Benefits (Tag list) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <ListPlus className="w-3.5 h-3.5 text-[#B58A5A]" />
                          <span>Key Benefits Bullet Points</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newBenefitInput}
                            onChange={(e) => setNewBenefitInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddBenefit();
                              }
                            }}
                            placeholder="e.g. Removes excess oil and unclogs deep pores"
                            className="flex-1 px-3.5 py-2 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                          <button
                            type="button"
                            onClick={handleAddBenefit}
                            className="px-4 py-2 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold hover:bg-[#15271F] cursor-pointer"
                          >
                            Add
                          </button>
                        </div>

                        {formData.benefits.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {formData.benefits.map((benefit, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#F8F6F0] border border-[#EFE9DD] text-slate-700"
                              >
                                <span>{benefit}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBenefit(idx)}
                                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Botanical Ingredients (Tag list) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
                          <span>Botanical Ingredients</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newIngredientInput}
                            onChange={(e) => setNewIngredientInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddIngredient();
                              }
                            }}
                            placeholder="e.g. Wild Turmeric (Kasturi Manjal)"
                            className="flex-1 px-3.5 py-2 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                          <button
                            type="button"
                            onClick={handleAddIngredient}
                            className="px-4 py-2 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold hover:bg-[#15271F] cursor-pointer"
                          >
                            Add
                          </button>
                        </div>

                        {formData.ingredients.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {formData.ingredients.map((ing, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-emerald-50 border border-emerald-200 text-emerald-800"
                              >
                                <span>{ing}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredient(idx)}
                                  className="text-emerald-500 hover:text-red-600 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* How to Use - YouTube Video Embed Link */}
                      <div className="space-y-2 p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Youtube className="w-4 h-4 text-red-600" />
                            <span>How to Use — YouTube Video Embed Link</span>
                          </label>
                          {formData.howToUseVideoUrl.trim() && (
                            <div className="flex items-center gap-2">
                              {isYouTubeUrl(formData.howToUseVideoUrl) ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Valid YouTube Link
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  Unrecognized URL format
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({ ...prev, howToUseVideoUrl: '' }))
                                }
                                className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-0.5 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                                <span>Clear</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                          Paste any YouTube link (e.g., <code className="bg-white px-1 py-0.5 rounded border border-[#EFE9DD]">https://www.youtube.com/watch?v=...</code>, short link <code className="bg-white px-1 py-0.5 rounded border border-[#EFE9DD]">https://youtu.be/...</code>, Shorts link, or embed code). This replaces static steps on the live product page.
                        </p>

                        <div className="relative">
                          <input
                            type="text"
                            value={formData.howToUseVideoUrl}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                howToUseVideoUrl: e.target.value,
                              }))
                            }
                            placeholder="https://www.youtube.com/watch?v=kJQP7kiw5Fk"
                            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EFE9DD] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                          />
                          <Youtube className="w-4 h-4 text-red-500 absolute left-3 top-3" />
                        </div>

                        {/* Live Interactive Embed Preview if Valid */}
                        {formData.howToUseVideoUrl.trim() &&
                          isYouTubeUrl(formData.howToUseVideoUrl) && (
                            <div className="mt-3 space-y-1.5 pt-2 border-t border-[#EFE9DD]">
                              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                <Play className="w-3 h-3 text-[#1F3A2E]" />
                                Live Video Player Preview:
                              </span>
                              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm border border-[#EFE9DD] bg-black">
                                <iframe
                                  src={formatYouTubeEmbedUrl(formData.howToUseVideoUrl) || ''}
                                  title="Admin Video Preview"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="absolute inset-0 w-full h-full border-0"
                                />
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Usage Instructions */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Usage Instructions (Application Ritual Notes)
                        </label>
                        <textarea
                          rows={2}
                          value={formData.usage}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, usage: e.target.value }))
                          }
                          placeholder="e.g. Mix 1-2 tbsp with rose water. Apply evenly on face and neck. Wash off after 15 minutes."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                        />
                      </div>
                    </div>

                    {/* Modal Bottom Actions */}
                    <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-5 py-2.5 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving Product...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-[#D4A373]" />
                            <span>{editingProduct ? 'Update Formulation' : 'Save & Publish'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* DELETE CONFIRMATION MODAL                                                 */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {deletingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl border border-[#EFE9DD] shadow-2xl max-w-md w-full p-6 space-y-5"
                >
                  <div className="flex items-center gap-3 text-red-600">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#1A201C]">
                        Delete Product?
                      </h4>
                      <p className="text-xs text-slate-500 font-light">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-bold text-slate-900">"{deletingProduct.name}"</span> from
                    the store catalog?
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setDeletingProduct(null)}
                      className="px-4 py-2 rounded-xl border border-[#EFE9DD] hover:bg-[#F8F6F0] text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
