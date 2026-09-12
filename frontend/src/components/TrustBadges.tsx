'use me';
'use client';

import { motion } from 'framer-motion';
import { Leaf, Award, MapPin, ShieldCheck } from 'lucide-react';

const BADGES = [
  {
    icon: Leaf,
    title: '100% Pure & Herbal',
    description: 'Zero synthetic parabens, sulfates, or artificial colors.',
  },
  {
    icon: Award,
    title: 'Ayurvedic Tradition',
    description: 'Time-tested herbal recipes for holistic skin & hair wellness.',
  },
  {
    icon: MapPin,
    title: 'Surat Heritage',
    description: 'Authentically formulated and freshly packed in Surat, Gujarat.',
  },
  {
    icon: ShieldCheck,
    title: 'Direct Farm Sourced',
    description: 'Pure wild turmeric, bhringraj, and rose petals from local farms.',
  },
];

export default function TrustBadges() {
  return (
    <section id="highlights" className="bg-[#1F3A2E] text-[#EFE9DD] py-12 px-4 sm:px-6 lg:px-8 border-y border-[#71846C]/30 relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {BADGES.map((badge, idx) => {
          const IconComp = badge.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4A373]/40 transition-colors"
            >
              <div className="p-3 rounded-lg bg-[#D4A373]/10 text-[#D4A373] shrink-0">
                <IconComp className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-sm tracking-wide">{badge.title}</h4>
                <p className="text-xs text-emerald-100/70 font-light leading-relaxed">{badge.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
