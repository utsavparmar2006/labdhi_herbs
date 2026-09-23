'use me';
'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, HeartHandshake, Leaf, Award } from 'lucide-react';

const VALUES = [
  {
    icon: Leaf,
    title: 'Time-Tested Formulas',
    description: 'Every recipe draws from traditional Ayurvedic texts, ensuring maximum potency and bio-availability.',
  },
  {
    icon: ShieldCheck,
    title: 'Chemical-Free & Safe',
    description: 'We strictly ban parabens, artificial perfumes, mineral oils, and synthetic fillers.',
  },
  {
    icon: HeartHandshake,
    title: 'Sustainably Sourced',
    description: 'Direct relationships with ethical Indian herb growers to ensure pure, unadulterated raw ingredients.',
  },
  {
    icon: Award,
    title: 'Surat Quality Lab',
    description: 'Handcrafted and quality-checked at our production facility in Surat, Gujarat before shipping.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-14 sm:py-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-2.5 sm:space-y-3 px-2">
        <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-[#1A201C] tracking-tight">
          Why Choose Labdhi Herbs?
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm font-light max-w-xl mx-auto">
          Built on transparency, natural efficacy, and deep respect for Ayurvedic wellness.
        </p>
      </div>

      {/* 2 Points / Cards per row on mobile, 4 columns on large screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
        {VALUES.map((val, idx) => {
          const IconComp = val.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white border border-[#EFE9DD] hover:border-[#1F3A2E]/40 shadow-xs hover:shadow-lg transition-all duration-300 text-center flex flex-col items-center justify-start space-y-2.5 sm:space-y-4"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] flex items-center justify-center shrink-0">
                <IconComp className="w-5 h-5 sm:w-7 sm:h-7 text-[#1F3A2E]" />
              </div>
              <h3 className="font-serif text-sm sm:text-lg lg:text-xl font-bold text-[#1A201C] leading-snug">
                {val.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 font-light leading-relaxed">
                {val.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
