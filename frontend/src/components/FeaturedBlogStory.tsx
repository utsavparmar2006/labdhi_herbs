'use me';
'use client';

import Link from 'next/link';
import { BlogPost } from '../types';
import { Calendar, Clock, ArrowUpRight, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeaturedBlogStoryProps {
  post: BlogPost;
}

export default function FeaturedBlogStory({ post }: FeaturedBlogStoryProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#EFE9DD] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 group">
      <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
        
        {/* Left Column: Cover Image (60% width on Desktop) */}
        <div className="lg:col-span-7 relative aspect-[16/10] bg-[#F8F6F0] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Category Tag Overlay */}
          <div className="absolute top-4 left-4">
            <span className="px-3.5 py-1.5 rounded-full bg-[#1F3A2E] text-[#D4A373] text-xs font-bold uppercase tracking-wider shadow-md inline-flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" />
              <span>{post.category}</span>
            </span>
          </div>
        </div>

        {/* Right Column: Editorial Article Information (40% width on Desktop) */}
        <div className="lg:col-span-5 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            
            <span className="text-[11px] font-bold text-[#71846C] uppercase tracking-wider block">
              Featured Journal Lead Story
            </span>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors leading-tight">
              {post.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>

          </div>

          <div className="pt-6 border-t border-[#EFE9DD] flex items-center justify-between">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-3 text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#B58A5A]" />
                  {post.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#B58A5A]" />
                  {post.readTime}
                </span>
              </div>
              <span className="text-slate-600 font-bold block">By {post.author}</span>
            </div>

            <Link
              href={`/blog/#article-${post.id}`}
              className="w-12 h-12 rounded-full bg-[#1F3A2E] hover:bg-[#15271F] text-[#D4A373] flex items-center justify-center transition-all cursor-pointer shadow-md group-hover:scale-110"
              title="Read Full Story"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
