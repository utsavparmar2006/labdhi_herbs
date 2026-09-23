'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OriginalTransparentLogo from './OriginalTransparentLogo';
import NewsletterSubscribeModal from './NewsletterSubscribeModal';
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
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Footer() {
  const { settings, profile } = useSiteSettings();
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [subscribeEmailInput, setSubscribeEmailInput] = useState('');
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);
  const [subscribedData, setSubscribedData] = useState<{ name?: string; couponCode?: string } | null>(null);

  useEffect(() => {
    const checkSubscribed = () => {
      try {
        const saved = localStorage.getItem('labdhi_subscribed');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.subscribed) {
            setIsAlreadySubscribed(true);
            setSubscribedData(parsed);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    checkSubscribed();
    window.addEventListener('labdhi_newsletter_subscribed', checkSubscribed);
    return () => {
      window.removeEventListener('labdhi_newsletter_subscribed', checkSubscribed);
    };
  }, []);

  const fullAddress = settings.address || profile.address || '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009';
  const phone = settings.supportPhone || profile.adminPhone || '+91 93283 49328';
  const cleanPhone = phone.replace(/[^+\d]/g, '');
  const email = settings.supportEmail || profile.adminEmail || 'support@labdhiherbs.com';
  const city = settings.city || profile.city || 'Surat';
  const state = settings.state || profile.state || 'Gujarat';
  const country = profile.country || 'India';

  const whatsappRaw = settings.whatsappNumber || settings.supportPhone || profile.adminPhone || '+91 93283 49328';
  const cleanWhatsApp = whatsappRaw.replace(/[^+\d]/g, '').replace(/^\+/, '');

  const facebookUrl = settings.social?.facebook || profile.facebook || 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage';
  const instagramUrl = settings.social?.instagram || profile.instagram || 'https://www.instagram.com/labdhiherbs/';
  const youtubeUrl = settings.social?.youtube || profile.youtube;
  const twitterUrl = settings.social?.twitter || profile.twitter;

  // Dynamic logo check
  const darkLogo = settings.logoDark || settings.logoLight;

  return (
    <footer className="bg-[#F8F6F0] text-[#1A201C] border-t border-[#EFE9DD] pt-12 sm:pt-16 pb-8 sm:pb-12 relative overflow-hidden">
      
      {/* Background Soft Glow Accent */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#D4A373]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 relative z-10">
        
        {/* Newsletter Banner - Clean Light Luxury Card */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border border-[#EFE9DD] flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6 shadow-sm">
          {isAlreadySubscribed ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 w-full">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] border border-[#C5DFD3] flex items-center justify-center shrink-0 text-[#1F3A2E] shadow-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#14261E]">
                    {subscribedData?.name ? `Namaste ${subscribedData.name} ji! ` : ''}You&apos;re subscribed to Labdhi Herbs 🌿
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thank you for being part of our Ayurvedic wellness family. Your exclusive welcome benefits are active.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 bg-[#F8F6F0] px-3.5 py-2 rounded-xl border border-[#EFE9DD]">
                  <span className="text-[11px] text-slate-500 font-medium">Coupon:</span>
                  <span className="font-mono font-bold text-xs text-[#14261E] tracking-wider bg-white px-2.5 py-1 rounded-lg border border-[#EFE9DD]">
                    {subscribedData?.couponCode || 'WELCOME10'}
                  </span>
                </div>
                <Link
                  href="/products"
                  className="px-4 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Shop Herbs</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4A373]" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1.5 text-center lg:text-left w-full lg:w-auto">
                <h3 className="font-serif text-lg sm:text-2xl font-bold text-[#1A201C] leading-snug">
                  Subscribe for Special Herbal Offers &amp; Wellness Tips
                </h3>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setIsSubscribeModalOpen(true);
                }}
                className="flex flex-col sm:flex-row w-full lg:w-auto max-w-md gap-2.5 sm:gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={subscribeEmailInput}
                  onChange={(e) => setSubscribeEmailInput(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-[#1A201C] placeholder-slate-400 text-xs focus:outline-none focus:border-[#1F3A2E] focus:ring-1 focus:ring-[#1F3A2E] flex-1 min-w-[200px]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm hover:shadow-md active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            </>
          )}
        </div>

        {/* Modal Dialog for Lead Capture */}
        <NewsletterSubscribeModal
          isOpen={isSubscribeModalOpen}
          onClose={() => setIsSubscribeModalOpen(false)}
          initialEmail={subscribeEmailInput}
          source="footer_newsletter"
        />

        {/* 4-Column Footer Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 pt-2">
          
          {/* Column 1: Contact Info (Full width on mobile) */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              {darkLogo ? (
                <img
                  src={darkLogo.startsWith('http') ? darkLogo : `http://localhost:5000${darkLogo}`}
                  alt="Labdhi Herbs"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              ) : (
                <OriginalTransparentLogo className="h-10 sm:h-12 w-auto" isDarkBackground={false} />
              )}
            </Link>

            <p className="text-xs text-slate-600 font-light leading-relaxed max-w-sm">
              Pure Ayurvedic medicines, face packs, hair oils, skincare lotions, and authentic herbal wellness handcrafted in {city}, {state}.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-700 font-light pt-1">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B58A5A] shrink-0 mt-0.5" />
                <span className="leading-snug">{fullAddress}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#B58A5A] shrink-0" />
                <a href={`tel:${cleanPhone}`} className="hover:underline text-[#1F3A2E] font-medium">{phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#B58A5A] shrink-0" />
                <a href={`mailto:${email}`} className="hover:underline text-[#1F3A2E] font-medium truncate max-w-[240px] sm:max-w-none">{email}</a>
              </li>
            </ul>
          </div>

          {/* Column 2: Categories */}
          <div className="col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F3A2E] tracking-wide border-b border-[#EFE9DD] pb-2 min-h-[28px] sm:min-h-[32px] flex items-end">
              Herbal Care
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link href="/shop/hair-care" className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 leading-snug">
                  <Leaf className="w-3 h-3 text-[#B58A5A] shrink-0" /> Hair Care Oils
                </Link>
              </li>
              <li>
                <Link href="/shop/skin-face-care" className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 leading-snug">
                  <Leaf className="w-3 h-3 text-[#B58A5A] shrink-0" /> Skin &amp; Face Packs
                </Link>
              </li>
              <li>
                <Link href="/shop/muscle-joint-care" className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 leading-snug">
                  <Leaf className="w-3 h-3 text-[#B58A5A] shrink-0" /> Muscle &amp; Joint Balms
                </Link>
              </li>
              <li>
                <Link href="/shop/weight-loss" className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 leading-snug">
                  <Leaf className="w-3 h-3 text-[#B58A5A] shrink-0" /> Ayurvedic Churna
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/shop" className="hover:text-[#1F3A2E] transition-colors flex items-center gap-1.5 font-bold text-[#B58A5A] leading-snug">
                  <ArrowRight className="w-3 h-3 shrink-0" /> All Formulations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links & Policies */}
          <div className="col-span-1 space-y-3.5">
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F3A2E] tracking-wide border-b border-[#EFE9DD] pb-2 min-h-[28px] sm:min-h-[32px] flex items-end">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><Link href="/about" className="hover:text-[#1F3A2E] transition-colors block leading-snug">About Us</Link></li>
              <li><Link href="/faq" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Help &amp; FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Track Order</Link></li>
              <li><Link href="/terms" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Privacy Policy</Link></li>
              <li><Link href="/refund" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Refund Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-[#1F3A2E] transition-colors block leading-snug">Shipping Policy</Link></li>
              <li><a href={`tel:${cleanPhone}`} className="hover:text-[#1F3A2E] transition-colors block leading-snug">Contact Support</a></li>
            </ul>
          </div>

          {/* Column 4: Follow Us & Direct Assistance */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1 space-y-3.5 pt-2 sm:pt-0">
            <h4 className="font-serif text-sm sm:text-base font-bold text-[#1F3A2E] tracking-wide border-b border-[#EFE9DD] pb-2 min-h-[28px] sm:min-h-[32px] flex items-end">
              Follow Our Journey
            </h4>
            <p className="text-xs text-slate-600 font-light leading-relaxed">
              Connect with us for daily botanical wellness insights, customer transformations, and herbal remedies.
            </p>

            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
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
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
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
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
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
                  className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#1F3A2E] hover:text-white text-[#1F3A2E] border border-[#EFE9DD] transition-colors cursor-pointer shadow-xs"
                  aria-label="Twitter Profile"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Direct WhatsApp Consultation Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${cleanWhatsApp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] text-xs font-bold transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse shrink-0" />
                <span>WhatsApp Help: {whatsappRaw}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 sm:pt-8 border-t border-[#EFE9DD] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>{settings.copyrightText || `Copyright ${new Date().getFullYear()} © Labdhi Herbs. All rights reserved.`}</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>100% Ayurvedic</span>
            <span>•</span>
            <span>{city}, {state}, {country}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
