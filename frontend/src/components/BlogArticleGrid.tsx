'use me';
'use client';

import { BLOG_POSTS } from '../services/mockData';
import { BlogPost } from '../types';
import { Calendar, Clock, ArrowRight, Leaf, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogArticleGridProps {
  selectedCategory: string;
  searchQuery: string;
  onSelectArticle: (post: BlogPost) => void;
  posts?: BlogPost[];
}

export default function BlogArticleGrid({
  selectedCategory,
  searchQuery,
  onSelectArticle,
  posts,
}: BlogArticleGridProps) {
  const sourcePosts = posts && posts.length > 0 ? posts : BLOG_POSTS;

  const filteredPosts = sourcePosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      post.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(post.category.toLowerCase());

    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Grid Results Header */}
      <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1A201C] uppercase tracking-wider">
          <Leaf className="w-4 h-4 text-[#1F3A2E]" />
          <span>Showing {filteredPosts.length} Journal Articles</span>
        </div>

        {selectedCategory !== 'All' && (
          <span className="text-xs text-slate-500 font-medium">
            Active Filter: <strong className="text-[#1F3A2E]">{selectedCategory}</strong>
          </span>
        )}
      </div>

      {/* Articles Grid (Pure Image Cards with Overlay Details) */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#EFE9DD] space-y-3">
          <p className="text-sm font-semibold text-slate-700">No journal articles found matching your search.</p>
          <p className="text-xs text-slate-400 font-light">Try searching for "hair care", "ayurveda", or "skincare".</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <motion.article
                key={post._id || post.id || post.slug}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                onClick={() => onSelectArticle(post)}
                className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer border border-[#EFE9DD] min-h-[380px] sm:min-h-[420px] bg-black select-none"
              >
                {/* Full Card Background Image (Always Visible) */}
                <img
                  src={post.image}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-95"
                />

                {/* Dark Gradient Overlay for Base Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60 transition-opacity duration-300" />

                {/* Upper Side Overlay: Date & Reading Time */}
                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-medium">
                    <Calendar className="w-3 h-3 text-[#D4A373]" />
                    <span>{post.date}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-medium text-[#D4A373]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Lower Side Overlay: Category Tag & Article Title (Default State) */}
                <div className="absolute bottom-4 left-4 right-4 z-10 space-y-2 transition-all duration-300 group-hover:opacity-0 group-hover:translate-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider shadow-md">
                    {post.category}
                  </span>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md line-clamp-2">
                    {post.title}
                  </h3>
                </div>

                {/* Hover State Translucent Overlay (Image Remains Visible Underneath) */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/80 to-black/60 backdrop-blur-sm p-6 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-all duration-400 transform translate-y-3 group-hover:translate-y-0 text-white">
                  <div className="space-y-3 pt-6">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3 text-xs">
                      <span className="px-3 py-1 rounded-full bg-[#D4A373] text-[#1F3A2E] text-[10px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-emerald-200/90 font-medium">By {post.author}</span>
                    </div>

                    <h4 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                      {post.title}
                    </h4>

                    {/* Excerpt Description Fitted Neatly Inside Image Bounds */}
                    <p className="text-xs sm:text-sm text-emerald-100/90 font-light leading-relaxed line-clamp-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-[#D4A373]">
                    <span>Read Full Article</span>
                    <div className="w-9 h-9 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center border border-[#D4A373]/40 shadow-lg">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>

              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}
