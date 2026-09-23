'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SmoothScroll from '../../components/SmoothScroll';
import Header from '../../components/Header';
import FeaturedBlogStory from '../../components/FeaturedBlogStory';
import KnowledgeGarden from '../../components/KnowledgeGarden';
import BlogArticleGrid from '../../components/BlogArticleGrid';
import QuickViewModal from '../../components/QuickViewModal';
import CartDrawer from '../../components/CartDrawer';
import AuthModal from '../../components/AuthModal';
import SearchModal from '../../components/SearchModal';
import NewsletterSubscribeModal from '../../components/NewsletterSubscribeModal';
import Footer from '../../components/Footer';
import { BLOG_POSTS } from '../../services/mockData';
import { getBlogPosts } from '../../services/api';
import { Product, BlogPost } from '../../types';
import { useCart } from '../../context/CartContext';
import { ChevronRight, ChevronDown, Leaf, Search, Mail, Calendar, Clock, X, ArrowRight, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BlogClient() {
  const { cartCount, openCart, addToCart: handleAddToCart } = useCart();
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOG_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('labdhi_subscribed');
      if (saved && JSON.parse(saved)?.subscribed) {
        setIsSubscribed(true);
      }
    } catch (e) {}
  }, []);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadBlogs = async () => {
      try {
        const data = await getBlogPosts();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setBlogs(data);
        }
      } catch (err) {
        console.warn('Using default blog posts:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Deep-link to open article if URL contains ?id=... or #article-...
  useEffect(() => {
    if (typeof window !== 'undefined' && blogs.length > 0) {
      const hash = window.location.hash.replace('#article-', '').replace('#', '');
      const searchParams = new URLSearchParams(window.location.search);
      const articleId = searchParams.get('id') || searchParams.get('article') || hash;
      if (articleId) {
        const found = blogs.find(
          (b) => b.id === articleId || (b as any)._id === articleId || b.slug === articleId
        );
        if (found) setSelectedArticle(found);
      }
    }
  }, [blogs]);

  const defaultCategories = ['All', 'Hair Care', 'Skin Care', 'Joint Care', 'Ayurveda', 'Wellness'];
  const dynamicCats = Array.from(new Set(blogs.map((b) => b.category).filter(Boolean)));
  const categories = Array.from(new Set([...defaultCategories, ...dynamicCats]));
  const leadFeaturedPost = blogs.find((b) => b.featured) || blogs[0] || BLOG_POSTS[0];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribeModalOpen(true);
  };

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

        {/* Editorial Hero Banner (Clean Ayurvedic Deep Green Matching Policy Pages) */}
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
              <span className="text-[#D4A373] font-semibold">The Herbal Journal</span>
            </nav>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Knowledge for a Healthier, More Natural Life
            </h1>

            <p className="text-xs sm:text-base text-emerald-100/75 font-light max-w-2xl mx-auto leading-relaxed">
              Explore time-tested Ayurvedic routines, botanical ingredient guides, and hair, skin, and joint care wisdom from our Surat herbalists.
            </p>

            {/* Search Input Bar */}
            <div className="max-w-md w-full mx-auto relative pt-2">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by topic or herb..."
                  className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white text-slate-800 placeholder-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A373] shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1 rounded-full hover:bg-slate-100 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Responsive Category Selector */}
            <div className="pt-4 max-w-2xl mx-auto space-y-3">
              {/* Mobile Quick Dropdown (Visible on small screens for instant selection) */}
              <div className="sm:hidden w-full max-w-xs mx-auto">
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-2xl bg-white border border-[#EFE9DD] text-xs font-bold text-[#1F3A2E] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]/20 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? '🌿 All Botanical Topics' : `🌿 ${cat}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#B58A5A] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Category Pills (Flex-wrap across mobile and desktop, zero horizontal scrollbar) */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold sm:font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-[#1F3A2E] text-[#D4A373] shadow-md ring-1 ring-[#D4A373]/40 scale-105'
                          : 'bg-white text-slate-600 hover:bg-[#EFE9DD]/60 hover:text-[#1F3A2E] border border-[#EFE9DD] shadow-xs'
                      }`}
                    >
                      {isSelected && <Leaf className="w-3 h-3 text-[#D4A373] shrink-0" />}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* Main Content Sections */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          
          {/* Main Article Grid Collection */}
          <section className="space-y-3">
            <BlogArticleGrid
              posts={blogs}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSelectArticle={(post) => setSelectedArticle(post)}
            />
          </section>

          {/* Editorial Newsletter Subscription CTA */}
          <section className="p-8 sm:p-12 rounded-3xl bg-[#14261E] text-[#EFE9DD] border border-[#71846C]/30 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-bold uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>The Herbal Journal Newsletter</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
                Stay Connected With Natural Remedies
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/70 font-light leading-relaxed">
                Receive weekly herbal wellness tips, Ayurvedic routines, and exclusive product offers directly in your inbox. No spam ever.
              </p>
            </div>

            {isSubscribed ? (
              <div className="flex items-center gap-3 bg-white/10 px-5 py-3.5 rounded-2xl border border-white/20 relative z-10">
                <span className="text-emerald-400 font-bold">✓</span>
                <p className="text-xs text-white font-medium">
                  You are already subscribed to The Herbal Journal! Thank you for being with us.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="max-w-md flex flex-col sm:flex-row gap-3 relative z-10">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-emerald-200/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#D4A373]"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-2xl bg-[#D4A373] hover:bg-[#b88c5d] text-[#1F3A2E] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </section>

        </main>

        {/* Lead Capture Modal */}
        <NewsletterSubscribeModal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          initialEmail={newsletterEmail}
          source="blog_journal"
        />

        {/* Article Full Reader Modal */}
        <AnimatePresence>
          {selectedArticle && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedArticle(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl z-10 border border-[#EFE9DD] max-h-[85vh] flex flex-col"
              >
                <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#F8F6F0]">
                  <span className="px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 sm:p-8 space-y-6 overflow-y-auto font-sans text-slate-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[#B58A5A]" /> {selectedArticle.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#B58A5A]" /> {selectedArticle.readTime}</span>
                      <span>•</span>
                      <span className="font-bold text-[#1F3A2E]">By {selectedArticle.author}</span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C] leading-tight">
                      {selectedArticle.title}
                    </h2>
                  </div>

                  {/* Full Uncropped Image Showcase */}
                  <div className="relative rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#EFE9DD] flex items-center justify-center p-2 sm:p-3 group">
                    {/* Ambient glow matching the article image colors */}
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110 pointer-events-none"
                      style={{ backgroundImage: `url(${selectedArticle.image})` }}
                    />
                    <img
                      src={selectedArticle.image}
                      alt={selectedArticle.title}
                      className="relative z-10 w-full h-auto max-h-[500px] object-contain rounded-xl shadow-xs transition-transform duration-300 cursor-zoom-in"
                      onClick={() => setFullScreenImage(selectedArticle.image)}
                    />
                    {/* Expand to Fullscreen Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFullScreenImage(selectedArticle.image);
                      }}
                      className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/85 text-white text-xs font-medium backdrop-blur-md shadow-lg transition-all"
                      title="View full image"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[#D4A373]" />
                      <span className="text-[11px] font-medium">View Full</span>
                    </button>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm font-light leading-relaxed text-slate-600">
                    <p className="font-medium text-slate-800 text-sm leading-relaxed">{selectedArticle.excerpt}</p>
                    {selectedArticle.content ? (
                      selectedArticle.content.split('\n\n').map((para, i) => (
                        <p key={i} className="leading-relaxed whitespace-pre-line">{para}</p>
                      ))
                    ) : (
                      <>
                        <p>
                          At Labdhi Herbs, we believe that true wellness stems from nature. Handcrafted in Surat, Gujarat, our Ayurvedic formulations adhere to centuries-old herbal principles. Incorporating natural plant extracts into your daily self-care routine restores physical harmony, promotes deep hair and skin rejuvenation, and relieves bodily fatigue.
                        </p>
                        <p>
                          Regular application of cold-pressed herbal oils and botanical ubtans provides sustained nourishment without introducing harsh chemicals or synthetic parabens.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between text-xs">
                  <span className="text-slate-500">Enjoyed this guide? Explore our formulations in the shop.</span>
                  <Link href="/shop" className="px-4 py-2 rounded-xl bg-[#1F3A2E] text-white font-bold hover:bg-[#15271F] transition-colors">
                    Shop Formulations
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Full Image Lightbox Modal */}
        <AnimatePresence>
          {fullScreenImage && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFullScreenImage(null)}
                className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="relative z-10 max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
              >
                <button
                  onClick={() => setFullScreenImage(null)}
                  className="absolute -top-12 right-0 p-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                  aria-label="Close full view"
                >
                  <X className="w-5 h-5" />
                  <span className="hidden sm:inline">Close</span>
                </button>
                <img
                  src={fullScreenImage}
                  alt="Full Article Image"
                  className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer />

        {/* Modals & Drawers */}
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectProduct={(p) => setQuickViewProduct(p)}
        />

      </div>
    </SmoothScroll>
  );
}
