'use client';

import Link from 'next/link';
import OriginalTransparentLogo from './OriginalTransparentLogo';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Youtube,
  Twitter,
  Leaf, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer() {
  const { settings, profile } = useSiteSettings();

  const fullAddress = profile.address || '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009';
  const phone = profile.adminPhone || '+91 93283 49328';
  const cleanPhone = phone.replace(/[^+\d]/g, '');
  const email = profile.adminEmail || 'support@labdhiherbs.com';
  const city = profile.city || 'Surat';
  const state = profile.state || 'Gujarat';
  const country = profile.country || 'India';

  const facebookUrl = profile.facebook || 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage';
  const instagramUrl = profile.instagram || 'https://www.instagram.com/labdhiherbs/';
  const youtubeUrl = profile.youtube;
  const twitterUrl = profile.twitter;

  // Dynamic logo check
  const darkLogo = settings.logoDark;

  return (
    <footer className="bg-[#14261E] text-[#EFE9DD] border-t border-[#71846C]/30 pt-12 sm:pt-16 pb-8 sm:pb-12 relative overflow-hidden">
      
      {/* Background Glow Accent */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        
        {/* Newsletter Banner */}
        <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#1F3A2E] border border-[#71846C]/40 flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center lg:text-left w-full lg:w-auto">
            <div className="inline-flex items-center gap-1.5 text-[#D4A373] text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5" />
              <span>Join Labdhi Herbal Circle</span>
            </div>
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-white leading-snug">
              Subscribe for Special Herbal Offers &amp; Wellness Tips
            </h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to Labdhi Herbs newsletter!'); }} className="flex flex-col sm:flex-row w-full lg:w-auto max-w-md gap-2.5 sm:gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              required
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-emerald-100/40 text-xs focus:outline-none focus:border-[#D4A373] flex-1 min-w-[200px]"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#D4A373] hover:bg-[#c49261] text-[#1F3A2E] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pt-2">
          
          {/* Column 1: Contact Info (Full width on mobile) */}
          <div className="col-span-2 lg:col-span-1 space-y-3.5">
            <Link href="/" className="inline-block">
              {darkLogo ? (
                <img
                  src={darkLogo.startsWith('http') ? darkLogo : `http://localhost:5000${darkLogo}`}
                  alt="Labdhi Herbs"
                  className="h-9 sm:h-11 md:h-12 w-auto object-contain"
                />
              ) : (
                <OriginalTransparentLogo className="h-9 sm:h-11 md:h-12 w-auto" isDarkBackground={true} />
              )}
            </Link>

            <p className="text-xs text-emerald-100/70 font-light leading-relaxed">
              Pure Ayurvedic medicines, face packs, hair oils, skincare lotions, and authentic herbal wellness handcrafted in {city}, {state}.
            </p>

            <ul className="space-y-2.5 text-xs text-emerald-100/90 font-light pt-1">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4A373] shrink-0 mt-0.5" />
                <span>{fullAddress}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D4A373] shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:underline text-white font-medium">{phone}</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4A373] shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline text-white">{email}</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div className="col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wider border-b border-[#71846C]/30 pb-2">
              Herbal Care
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                <Link href="/shop/hair-care" className="hover:text-[#D4A373] transition-colors flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-[#71846C] shrink-0" /> Hair Care Oils
                </Link>
              </li>
              <li>
                <Link href="/shop/skin-face-care" className="hover:text-[#D4A373] transition-colors flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-[#71846C] shrink-0" /> Skin &amp; Face Packs
                </Link>
              </li>
              <li>
                <Link href="/shop/muscle-joint-care" className="hover:text-[#D4A373] transition-colors flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-[#71846C] shrink-0" /> Muscle &amp; Joint Balms
                </Link>
              </li>
              <li>
                <Link href="/shop/weight-loss" className="hover:text-[#D4A373] transition-colors flex items-center gap-1.5">
                  <Leaf className="w-3 h-3 text-[#71846C] shrink-0" /> Ayurvedic Churna
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-[#D4A373] transition-colors flex items-center gap-1.5 font-semibold text-[#D4A373]">
                  <ArrowRight className="w-3 h-3 shrink-0" /> All Formulations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links & Policies */}
          <div className="col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wider border-b border-[#71846C]/30 pb-2">
              Customer Care &amp; Info
            </h4>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li><Link href="/about" className="hover:text-[#D4A373] transition-colors">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-[#D4A373] transition-colors">Help &amp; FAQ</Link></li>
              <li><Link href="/orders" className="hover:text-[#D4A373] transition-colors">Track Your Order</Link></li>
              <li><Link href="/terms" className="hover:text-[#D4A373] transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#D4A373] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-[#D4A373] transition-colors">Refund &amp; Return</Link></li>
              <li><Link href="/shipping" className="hover:text-[#D4A373] transition-colors">Shipping Info</Link></li>
              <li><a href={`tel:${cleanPhone}`} className="hover:text-[#D4A373] transition-colors">Need Help? Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Follow Us & Brand Assurance */}
          <div className="col-span-2 lg:col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-wider border-b border-[#71846C]/30 pb-2">
              Follow Our Journey
            </h4>
            <p className="text-xs text-emerald-100/70 font-light">
              Connect with us for daily botanical wellness insights, customer transformations, and herbal remedies.
            </p>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-[#D4A373] hover:text-[#1F3A2E] text-white transition-colors cursor-pointer"
                  aria-label="Facebook Page"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-[#D4A373] hover:text-[#1F3A2E] text-white transition-colors cursor-pointer"
                  aria-label="Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-[#D4A373] hover:text-[#1F3A2E] text-white transition-colors cursor-pointer"
                  aria-label="YouTube Channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {twitterUrl && (
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-[#D4A373] hover:text-[#1F3A2E] text-white transition-colors cursor-pointer"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="p-3.5 sm:p-4 rounded-xl bg-white/5 border border-white/10 text-xs text-emerald-100/80 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-[#D4A373]">
                <ShieldCheck className="w-4 h-4" /> Authentic Herbal Assurance
              </div>
              <p className="text-[11px] text-slate-400 font-light">
                100% pure botanical remedies crafted and freshly dispatched from {city}, {state}.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#71846C]/30 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-100/60 gap-3 text-center sm:text-left">
          <p>{settings.copyrightText || `Copyright ${new Date().getFullYear()} © Labdhi Herbs. All rights reserved.`}</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Ayurvedic</span>
            <span>•</span>
            <span>{city}, {state}, {country}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
