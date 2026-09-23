'use me';
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SmoothScroll from '../../components/SmoothScroll';
import Header from '../../components/Header';
import FeaturedStoryVideo from '../../components/FeaturedStoryVideo';
import AsymmetricGallery from '../../components/AsymmetricGallery';
import QuickViewModal from '../../components/QuickViewModal';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import Footer from '../../components/Footer';
import { Product, SuccessStory, MainCategory } from '../../types';
import { getSuccessStories, getCategories } from '../../services/api';
import { useCart } from '../../context/CartContext';
import {
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Video,
  Leaf,
  RotateCcw,
  Droplets,
  Sun,
  Activity,
  Filter,
  Check,
} from 'lucide-react';

export default function StoriesClient() {
  const { cartCount, openCart, addToCart: handleAddToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [categories, setCategories] = useState<MainCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoStoryId, setSelectedVideoStoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [storiesRes, catsRes] = await Promise.all([
          getSuccessStories(),
          getCategories(),
        ]);
        if (storiesRes.success && storiesRes.data && storiesRes.data.length > 0) {
          setStories(storiesRes.data);
        }
        if (Array.isArray(catsRes)) {
          setCategories(catsRes);
        }
      } catch (err) {
        console.error('Failed to load success stories or categories:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtered stories according to customer selected category & subcategory
  const filteredStories = stories.filter((s) => {
    if (s.status !== 'active') return false;
    if (selectedCategory !== 'all') {
      const matchCat =
        s.mainCategory === selectedCategory ||
        s.mainCategory?.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;
    }
    if (selectedSubCategory !== 'all') {
      const matchSub =
        s.subCategory === selectedSubCategory ||
        s.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase();
      if (!matchSub) return false;
    }
    return true;
  });

  // Dedicated Video Stories vs Photo Transformations within filtered results
  const videoStories = filteredStories.filter(
    (s) =>
      s.storyType === 'video' || Boolean(s.videoUrl && s.videoUrl.trim().length > 0)
  );

  const photoStories = filteredStories.filter(
    (s) =>
      s.storyType !== 'video' && (!s.videoUrl || s.videoUrl.trim().length === 0)
  );

  const activeVideoStory =
    videoStories.find((s) => s.id === selectedVideoStoryId) ||
    videoStories.find((s) => s.featured) ||
    videoStories[0] ||
    null;

  const activeCategoryObj = categories.find(
    (c) => c.id === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  // Curated, unique categories for visual story portals (removes duplicate test categories)
  const categoryHighlights = useMemo(() => {
    const redundant = new Set(['skin-care', 'face-care', 'muscle-care', 'joint-care']);
    const validCategories = categories.filter((c) => !redundant.has(c.id));

    // Sort categories so those with verified customer stories appear first
    return validCategories.sort((a, b) => {
      const countA = stories.filter(
        (s) =>
          s.status === 'active' &&
          (s.mainCategory === a.id || s.mainCategory?.toLowerCase() === a.id.toLowerCase())
      ).length;
      const countB = stories.filter(
        (s) =>
          s.status === 'active' &&
          (s.mainCategory === b.id || s.mainCategory?.toLowerCase() === b.id.toLowerCase())
      ).length;
      return countB - countA;
    });
  }, [categories, stories]);

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD] font-sans">
        
        {/* Header Navigation */}
        <Header
          cartCount={cartCount}
          onOpenCart={openCart}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Success Stories Hero Banner (Clean Ayurvedic Deep Green Matching Policy Pages) */}
        <section className="relative pt-32 pb-14 md:pt-40 md:pb-20 bg-[#14261E] text-white overflow-hidden">
          {/* Background glow accent */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 text-center space-y-4 relative z-10 flex flex-col items-center">
            
            {/* Breadcrumb Navigation */}
            <nav className="inline-flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="text-[#D4A373] font-semibold">Success Stories</span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Customer Stories &amp; Transformations
            </h1>

            <p className="text-xs sm:text-base text-emerald-100/75 font-light max-w-2xl mx-auto leading-relaxed">
              Discover authentic video journeys, customer before &amp; after results, and verified experiences of pure Gujarati Ayurveda.
            </p>

          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16 relative">
          
          {/* ================================================================= */}
          {/* UNIQUE "AYURVEDIC STORY HIGHLIGHTS" PORTAL SUITE                  */}
          {/* ================================================================= */}
          <section className="bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] rounded-3xl border border-[#EFE9DD] p-6 sm:p-9 shadow-sm space-y-7 relative overflow-hidden">
            
            {/* Ambient luxury glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header with Luxury Brand Accent */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EFE9DD] pb-5 relative z-10">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#8C6D46] bg-[#F4EFE6]">
                  <Sparkles className="w-3 h-3 text-[#D4A373]" />
                  <span>Interactive Transformation Portals</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#14261E] tracking-tight">
                  Explore Journeys by Concern
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-light max-w-xl">
                  Tap on any customer transformation portal below to focus on authentic hair, skin, and joint recovery journeys.
                </p>
              </div>

              {selectedCategory !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                  }}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-[#14261E] bg-white hover:bg-[#F8F6F0] border border-[#EFE9DD] transition-all flex items-center gap-2 cursor-pointer shadow-2xs shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>View All Categories</span>
                </button>
              )}
            </div>

            {/* Visual Circular Story Portals (No scrollbar on desktop, smooth swipe on mobile) */}
            <div className="flex items-center justify-start md:justify-center gap-5 sm:gap-8 overflow-x-auto pb-3 pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10">
              
              {/* PORTAL 1: ALL TRANSFORMATIONS */}
              <div
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                }}
                className="flex flex-col items-center text-center space-y-2.5 shrink-0 group cursor-pointer"
              >
                <div
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] transition-all duration-300 ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-tr from-amber-400 via-[#D4A373] to-emerald-600 ring-4 ring-amber-400/30 shadow-xl shadow-amber-500/20 scale-105'
                      : 'bg-[#EFE9DD] hover:bg-gradient-to-tr hover:from-[#D4A373] hover:to-amber-300 hover:scale-105 shadow-2xs'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#14261E] flex items-center justify-center border-2 border-white relative shadow-inner">
                    <div className="text-center space-y-0.5">
                      <Sparkles
                        className={`w-7 h-7 mx-auto ${
                          selectedCategory === 'all' ? 'text-amber-300 animate-pulse' : 'text-[#D4A373]'
                        }`}
                      />
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-200/90 block">
                        ALL
                      </span>
                    </div>
                  </div>

                  {selectedCategory === 'all' && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-[#14261E] flex items-center justify-center shadow-md font-bold text-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 max-w-[90px]">
                  <span
                    className={`block text-xs sm:text-sm font-bold tracking-tight truncate ${
                      selectedCategory === 'all'
                        ? 'text-[#14261E] font-extrabold'
                        : 'text-slate-700 group-hover:text-[#14261E]'
                    }`}
                  >
                    All Results
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      selectedCategory === 'all'
                        ? 'bg-[#14261E] text-amber-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {stories.filter((s) => s.status === 'active').length} Stories
                  </span>
                </div>
              </div>

              {/* DYNAMIC CATEGORY STORY PORTALS */}
              {categoryHighlights.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = stories.filter(
                  (s) =>
                    s.status === 'active' &&
                    (s.mainCategory === cat.id ||
                      s.mainCategory?.toLowerCase() === cat.id.toLowerCase())
                ).length;

                // Rich photography based on category
                const imageSrc =
                  cat.image ||
                  (cat.id.includes('hair')
                    ? 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400'
                    : cat.id.includes('skin') || cat.id.includes('face')
                    ? 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'
                    : cat.id.includes('joint') || cat.id.includes('muscle')
                    ? 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400'
                    : 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400');

                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory('all');
                    }}
                    className="flex flex-col items-center text-center space-y-2.5 shrink-0 group cursor-pointer"
                  >
                    <div
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-tr from-amber-400 via-[#D4A373] to-emerald-600 ring-4 ring-amber-400/30 shadow-xl shadow-amber-500/20 scale-105'
                          : 'bg-[#EFE9DD] hover:bg-gradient-to-tr hover:from-[#D4A373] hover:to-amber-300 hover:scale-105 shadow-2xs'
                      }`}
                    >
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white relative">
                        <img
                          src={imageSrc}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div
                          className={`absolute inset-0 transition-opacity ${
                            isSelected ? 'bg-black/10' : 'bg-black/20 group-hover:bg-black/10'
                          }`}
                        />
                      </div>

                      {isSelected ? (
                        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-[#14261E] flex items-center justify-center shadow-md font-bold text-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      ) : count > 0 ? (
                        <span className="absolute -bottom-1 right-1/2 translate-x-1/2 px-2 py-0.5 rounded-full bg-[#14261E] text-amber-300 text-[10px] font-bold shadow-xs">
                          {count}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-0.5 max-w-[105px]">
                      <span
                        className={`block text-xs sm:text-sm font-bold tracking-tight truncate ${
                          isSelected
                            ? 'text-[#14261E] font-extrabold'
                            : 'text-slate-700 group-hover:text-[#14261E]'
                        }`}
                      >
                        {cat.name}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          isSelected
                            ? 'bg-[#14261E] text-amber-200'
                            : count > 0
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/60'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count > 0 ? `${count} ${count === 1 ? 'Story' : 'Stories'}` : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* SUB-CATEGORY FORMULATION PILL STRIP */}
            {activeCategoryObj &&
              activeCategoryObj.subCategories &&
              activeCategoryObj.subCategories.length > 0 && (
                <div className="pt-4 border-t border-[#EFE9DD] flex flex-wrap items-center justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span>Specific Formulation:</span>
                    </span>

                    <button
                      onClick={() => setSelectedSubCategory('all')}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedSubCategory === 'all'
                          ? 'bg-[#14261E] text-white shadow-xs'
                          : 'bg-white border border-[#EFE9DD] text-slate-600 hover:bg-[#F8F6F0]'
                      }`}
                    >
                      All {activeCategoryObj.name}
                    </button>

                    {activeCategoryObj.subCategories.map((sub) => {
                      const isSubSelected = selectedSubCategory === sub.id;
                      const subCount = stories.filter(
                        (s) =>
                          s.status === 'active' &&
                          (s.mainCategory === activeCategoryObj.id ||
                            s.mainCategory?.toLowerCase() ===
                              activeCategoryObj.id.toLowerCase()) &&
                          (s.subCategory === sub.id ||
                            s.subCategory?.toLowerCase() === sub.id.toLowerCase())
                      ).length;

                      return (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubCategory(sub.id)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSubSelected
                              ? 'bg-[#D4A373] text-[#14261E] font-bold shadow-xs'
                              : 'bg-white border border-[#EFE9DD] text-slate-600 hover:bg-[#F8F6F0]'
                          }`}
                        >
                          <span>{sub.name}</span>
                          {subCount > 0 && (
                            <span className="opacity-75 text-[10px]">({subCount})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubCategory('all');
                    }}
                    className="text-xs text-slate-500 hover:text-[#14261E] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Reset to All</span>
                  </button>
                </div>
              )}

          </section>

          {/* ACTIVE FILTER CONFIRMATION STRIP */}
          {selectedCategory !== 'all' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#14261E]/5 border border-[#14261E]/10 text-xs">
              <div className="flex items-center gap-2 text-[#14261E]">
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                <span className="font-medium">
                  Showing verified customer transformations for{' '}
                  <span className="font-bold underline decoration-[#D4A373] decoration-2">
                    {activeCategoryObj?.name || selectedCategory}
                  </span>
                  {selectedSubCategory !== 'all' && (
                    <span className="text-slate-500 font-normal">
                      {' '}›{' '}
                      {activeCategoryObj?.subCategories?.find(
                        (s) => s.id === selectedSubCategory
                      )?.name || selectedSubCategory}
                    </span>
                  )}
                  : ({videoStories.length} Video, {photoStories.length} Photos)
                </span>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubCategory('all');
                }}
                className="self-start sm:self-auto text-[11px] font-bold text-[#14261E] hover:text-[#8C6D46] underline cursor-pointer"
              >
                Clear Filter (Show All)
              </button>
            </div>
          )}

          {/* SECTION 1: Featured Cinematic Video Story */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EFE9DD] pb-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
                  Watch Real Customer Transformations
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-light max-w-xs">
                Hover over the video to preview or click to open full cinematic playback with audio.
              </p>
            </div>

            {videoStories.length > 0 ? (
              <>
                <FeaturedStoryVideo
                  story={activeVideoStory}
                  allStories={videoStories}
                  currentIndex={videoStories.findIndex((s) => s.id === activeVideoStory?.id)}
                  onPrevStory={() => {
                    const currIdx = videoStories.findIndex((s) => s.id === activeVideoStory?.id);
                    const prevIdx = (currIdx - 1 + videoStories.length) % videoStories.length;
                    setSelectedVideoStoryId(videoStories[prevIdx].id);
                  }}
                  onNextStory={() => {
                    const currIdx = videoStories.findIndex((s) => s.id === activeVideoStory?.id);
                    const nextIdx = (currIdx + 1) % videoStories.length;
                    setSelectedVideoStoryId(videoStories[nextIdx].id);
                  }}
                  onSelectStory={(idx) => {
                    if (videoStories[idx]) {
                      setSelectedVideoStoryId(videoStories[idx].id);
                    }
                  }}
                />

                {/* Multi-Video Selector (Shown if more than 1 video story exists) */}
                {videoStories.length > 1 && (
                  <div className="pt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      More Video Transformations ({videoStories.length}):
                    </p>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {videoStories.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVideoStoryId(v.id)}
                          className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            activeVideoStory?.id === v.id
                              ? 'bg-[#1F3A2E] text-[#EFE9DD] border-[#1F3A2E] shadow-sm'
                              : 'bg-white text-slate-700 border-[#EFE9DD] hover:bg-[#F8F6F0]'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5 text-[#D4A373]" />
                          <span>{v.customer}</span>
                          <span className="text-[10px] opacity-75 font-light">({v.formulation})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EFE9DD] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] flex items-center justify-center mx-auto text-slate-400">
                  <Video className="w-6 h-6 text-[#D4A373]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#14261E]">
                  No Customer Video Journeys in {activeCategoryObj?.name || 'this category'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  New video transformations are currently being produced! View the Before &amp; After photography below or view all categories.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#14261E] text-white text-xs font-bold hover:bg-[#1D362B] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>View All Transformation Videos</span>
                </button>
              </div>
            )}
          </section>

          {/* SECTION 2: Interactive Before & After Transformation Slider */}
          <section className="space-y-4 pt-4">
            {photoStories.length > 0 ? (
              <AsymmetricGallery stories={photoStories} />
            ) : (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#EFE9DD] text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] flex items-center justify-center mx-auto text-slate-400">
                  <Leaf className="w-6 h-6 text-[#D4A373]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#14261E]">
                  No Before &amp; After Photos in {activeCategoryObj?.name || 'this category'}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Explore other natural healing formulations or click below to view all customer proofs.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubCategory('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#14261E] text-white text-xs font-bold hover:bg-[#1D362B] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Show All Before &amp; After Photos</span>
                </button>
              </div>
            )}
          </section>

          {/* SECTION 4: Brand Trust Pillars & CTA */}
          <section className="p-8 sm:p-12 rounded-3xl bg-[#14261E] text-[#EFE9DD] border border-[#71846C]/30 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-3 relative z-10">
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                Begin Your Own Natural Healing Journey
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/75 font-light leading-relaxed">
                Join thousands across Surat and India who have revitalized their hair, skin, and joint vitality with Labdhi Herbs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 relative z-10">
              <Link
                href="/shop"
                className="px-8 py-4 rounded-2xl bg-[#D4A373] hover:bg-[#b88c5d] text-[#1F3A2E] font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
              >
                <span>Explore All Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>

        </main>

        <Footer />

        {/* Modals & Drawers */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer />

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => setQuickViewProduct(p)}
        />

      </div>
    </SmoothScroll>
  );
}
