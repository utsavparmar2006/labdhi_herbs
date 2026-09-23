'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BLOG_POSTS } from '../services/mockData';
import { getBlogPosts } from '../services/api';
import { BlogPost } from '../types';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

export default function BlogSection() {
  const [blogs, setBlogs] = useState<BlogPost[]>(BLOG_POSTS);

  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      try {
        const data = await getBlogPosts();
        if (isMounted && data && Array.isArray(data) && data.length > 0) {
          setBlogs(data);
        }
      } catch (err) {
        console.warn('Using default blog articles:', err);
      }
    };
    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter for blogs enabled for the home page showcase (showOnHome !== false)
  const homeEligible = blogs.filter((b) => (b as any).showOnHome !== false);
  const sourceBlogs = homeEligible.length > 0 ? homeEligible : blogs;

  const featuredPost = sourceBlogs.find((b) => b.featured) || sourceBlogs[0] || BLOG_POSTS[0];
  const secondaryPosts = sourceBlogs.filter((b) => (b._id || b.id) !== (featuredPost._id || featuredPost.id)).slice(0, 3);

  return (
    <section id="blog" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
        <div className="space-y-3 max-w-2xl">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A201C] tracking-tight">
            Herbal Insights & Ayurvedic Wisdom
          </h2>
          <p className="text-slate-600 text-sm font-light">
            Learn ancient remedies, holistic lifestyle tips, and botanical skincare routines from our experts.
          </p>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1F3A2E] hover:text-[#B58A5A] transition-colors"
        >
          <span>View All Articles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Featured Main Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 group rounded-2xl bg-white border border-[#EFE9DD] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <Link href="/blog" className="block relative h-72 overflow-hidden bg-slate-100">
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider">
              {featuredPost.category}
            </span>
          </Link>

          <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#71846C]" /> {featuredPost.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#71846C]" /> {featuredPost.readTime}</span>
              </div>

              <Link href={`/blog?id=${featuredPost.id || (featuredPost as any)._id}`}>
                <h3 className="font-serif text-2xl font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors leading-tight">
                  {featuredPost.title}
                </h3>
              </Link>

              <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                {featuredPost.excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-between">
              <span className="text-xs text-[#71846C] font-semibold">{featuredPost.author}</span>
              <Link href={`/blog?id=${featuredPost.id || (featuredPost as any)._id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F3A2E] group-hover:translate-x-1 transition-transform">
                Read Article <ArrowRight className="w-4 h-4 text-[#D4A373]" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Secondary Articles Stack (3 Cards matching Featured Article height) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {secondaryPosts.map((post, idx) => (
            <motion.div
              key={post._id || post.id || post.slug || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-4"
            >
              <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <span className="text-[#1F3A2E] font-bold uppercase">{post.category}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>

                  <h4 className="font-serif text-base font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-500 text-[11px]">{post.date}</span>
                  <Link href={`/blog?id=${post.id || (post as any)._id}`} className="text-[#1F3A2E] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
}
