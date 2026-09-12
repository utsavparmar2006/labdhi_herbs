'use me';
'use client';

import { motion } from 'framer-motion';
import { TESTIMONIALS } from '../services/mockData';
import { Star, Quote, CheckCircle2, Image as ImageIcon, PlayCircle } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <section id="gallery" className="py-24 bg-[#1F3A2E] text-[#EFE9DD] relative overflow-hidden">
      
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#71846C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#D4A373] text-xs font-semibold uppercase tracking-wider border border-white/20">
            <span>Customer Success Stories</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            Real Transformations & Genuine Feedback
          </h2>
          <p className="text-emerald-100/80 text-sm font-light">
            Discover why thousands across Surat and India trust Labdhi Herbs for their daily wellness routines.
          </p>
        </div>

        {/* Gallery Cards (Image & Video Galleries) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative h-64 rounded-2xl overflow-hidden border border-white/20 shadow-xl cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1512290900676-26c2a46486b6?auto=format&fit=crop&q=80&w=800"
              alt="Image Gallery Stories"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-[#D4A373] font-semibold">
                  <ImageIcon className="w-4 h-4" /> Success Image Gallery
                </span>
                <h4 className="font-serif text-xl font-bold">Skin & Hair Glow Results</h4>
              </div>
              <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-semibold hover:bg-white hover:text-[#1F3A2E] transition-colors">
                View Gallery
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="group relative h-64 rounded-2xl overflow-hidden border border-white/20 shadow-xl cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
              alt="Video Gallery Stories"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-xs text-[#D4A373] font-semibold">
                  <PlayCircle className="w-4 h-4" /> Customer Video Testimonials
                </span>
                <h4 className="font-serif text-xl font-bold">Watch Herbal Experiences</h4>
              </div>
              <span className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md text-xs font-semibold hover:bg-white hover:text-[#1F3A2E] transition-colors">
                Watch Videos
              </span>
            </div>
          </motion.div>

        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-[#D4A373]/40 transition-colors flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#D4A373]">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#71846C]/40" />
                </div>

                <p className="text-xs sm:text-sm text-emerald-100/90 font-light italic leading-relaxed">
                  "{item.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{item.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-slate-400 text-[10px]">{item.location}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#D4A373]/10 text-[#D4A373] text-[10px] font-semibold">
                  {item.productUsed}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
