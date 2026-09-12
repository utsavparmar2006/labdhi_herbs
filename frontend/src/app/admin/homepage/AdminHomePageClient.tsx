'use me';
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import VideoFolderPicker from '../components/VideoFolderPicker';
import ImageFolderPicker from '../components/ImageFolderPicker';
import { getHomePageConfig, updateHomePageConfig } from '../../../services/api';
import { HomePageConfigData } from '../../../types';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  LayoutTemplate,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_CONFIG: HomePageConfigData = {
  announcementBar: {
    enabled: true,
    phone: '+91 93283 49328',
    email: 'support@labdhiherbs.com',
    locationText: 'Surat, Gujarat',
    badgeText: '100% Authentic',
    messages: [
      '🌿 Pure Herbal Formulations • Free Shipping Across India',
      '🚚 Express Fast Dispatch Direct from Surat Workshop',
      '✨ Special Offer: 10% Extra Discount on First Order',
    ],
  },
  heroSection: {
    eyebrow: 'NATURAL • HERBAL • AYURVEDIC WELLNESS',
    headline: 'Pure Ayurvedic Formulations',
    subheadline: 'for Natural Healing & Glow',
    description:
      'Handcrafted with 100% pure botanical extracts from Surat, Gujarat. Experience deep nourishment, skin vitality, and holistic wellness rooted in ancient wisdom.',
    primaryBtnText: 'Explore Herbal Shop',
    primaryBtnLink: '/shop',
    secondaryBtnText: 'Watch Stories',
    secondaryBtnLink: '/gallery',
    videoUrl: '/videos/Create_a_premium_cinematic_bra.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920',
  },
};

export default function AdminHomePageClient() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [config, setConfig] = useState<HomePageConfigData>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [activeTab, setActiveTab] = useState<'announcement' | 'hero'>('announcement');
  const [newMessage, setNewMessage] = useState('');

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const fetchConfig = async () => {
      setIsLoading(true);
      const data = await getHomePageConfig();
      if (data) {
        setConfig({
          announcementBar: {
            ...DEFAULT_CONFIG.announcementBar,
            ...(data.announcementBar || {}),
          },
          heroSection: {
            ...DEFAULT_CONFIG.heroSection,
            ...(data.heroSection || {}),
          },
        });
      }
      setIsLoading(false);
    };

    fetchConfig();
  }, []);

  const handleSave = async (sectionName = 'Settings') => {
    setIsSaving(true);
    const res = await updateHomePageConfig(config);
    setIsSaving(false);

    if (res.success) {
      showToast(`${sectionName} updated and saved successfully!`);
      // Dispatch event for instant frontend live-update
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('homepageConfigUpdated', { detail: config }));
      }
    } else {
      showToast(res.message || 'Failed to update settings', 'error');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all fields to original brand defaults?')) {
      setConfig(DEFAULT_CONFIG);
      showToast('Reset to default values. Click "Update & Save" to apply.', 'success');
    }
  };

  const handleAddMessage = () => {
    if (!newMessage.trim()) return;
    setConfig((prev) => ({
      ...prev,
      announcementBar: {
        ...prev.announcementBar,
        messages: [...prev.announcementBar.messages, newMessage.trim()],
      },
    }));
    setNewMessage('');
  };

  const handleRemoveMessage = (index: number) => {
    if (config.announcementBar.messages.length <= 1) {
      showToast('You must keep at least 1 announcement message.', 'error');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      announcementBar: {
        ...prev.announcementBar,
        messages: prev.announcementBar.messages.filter((_, i) => i !== index),
      },
    }));
  };

  const handleUpdateMessage = (index: number, val: string) => {
    setConfig((prev) => {
      const updated = [...prev.announcementBar.messages];
      updated[index] = val;
      return {
        ...prev,
        announcementBar: {
          ...prev.announcementBar,
          messages: updated,
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex font-sans text-[#1A201C] pb-12">
      
      {/* Admin Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <AdminHeader onToggleMobileMenu={() => setMobileSidebarOpen(true)} title="Home Page CMS" />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Top Title & Save Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
                <span>Home Page CMS</span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#1A201C]">
                Manage Hero Line & Banner
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Customize the top announcement bar (hero line), contact numbers, location, and hero video in real time.
              </p>
            </div>

            {/* TOP ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl border border-[#EFE9DD] hover:bg-white text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => handleSave('All Changes')}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] text-white text-xs font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-[#D4A373]" />
                )}
                <span>{isSaving ? 'Saving Changes...' : 'Update & Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-md ${
                  toastMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {toastMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{toastMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LIVE PREVIEW BOX OF HERO LINE (ANNOUNCEMENT BAR) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1F3A2E] uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#B58A5A]" />
                <span>Live Preview: Top Announcement Bar (Hero Line)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-light">
                Updates dynamically as you edit settings below
              </span>
            </div>

            {/* Rendered Live Announcement Bar */}
            <div className="rounded-2xl overflow-hidden border border-[#71846C]/40 shadow-sm bg-[#1F3A2E] text-[#EFE9DD] py-2.5 px-4 sm:px-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Left Contact */}
              <div className="flex items-center gap-4 text-[11px] text-[#D4A373]">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  <span>{config.announcementBar.phone || '+91 93283 49328'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  <span>{config.announcementBar.email || 'support@labdhiherbs.com'}</span>
                </span>
              </div>

              {/* Center Ticker (Preview first message) */}
              <div className="flex items-center gap-2 font-medium text-center">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>{config.announcementBar.messages[0] || '🌿 Pure Ayurvedic Formulations'}</span>
              </div>

              {/* Right Location */}
              <div className="flex items-center gap-2 text-[11px] text-[#D4A373]">
                <span>{config.announcementBar.locationText || 'Surat, Gujarat'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-300 font-semibold">
                  {config.announcementBar.badgeText || '100% Authentic'}
                </span>
              </div>
            </div>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex items-center gap-3 border-b border-[#EFE9DD] pb-4">
            <button
              onClick={() => setActiveTab('announcement')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'announcement'
                  ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-[#EFE9DD]/50 border border-[#EFE9DD]'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>1. Top Hero Line / Announcement Bar</span>
            </button>

            <button
              onClick={() => setActiveTab('hero')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-[#1F3A2E] text-[#EFE9DD] shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-[#EFE9DD]/50 border border-[#EFE9DD]'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>2. Cinematic Hero Video</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: Top Hero Line / Announcement Bar */}
          {activeTab === 'announcement' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Card 1: Contact & Location Settings */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                      Contact Details & Authenticity Badges
                    </h3>
                    <p className="text-xs text-slate-500 font-light">
                      Displayed on the left and right flanks of the top hero announcement line.
                    </p>
                  </div>

                  {/* Enable/Disable switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">Bar Visibility:</span>
                    <button
                      onClick={() =>
                        setConfig((prev) => ({
                          ...prev,
                          announcementBar: {
                            ...prev.announcementBar,
                            enabled: !prev.announcementBar.enabled,
                          },
                        }))
                      }
                      className="cursor-pointer"
                    >
                      {config.announcementBar.enabled ? (
                        <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enabled</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-300">
                          <span>Hidden</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="text"
                      value={config.announcementBar.phone}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, phone: e.target.value },
                        }))
                      }
                      placeholder="+91 93283 49328"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] text-xs"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Support Email</span>
                    </label>
                    <input
                      type="email"
                      value={config.announcementBar.email}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, email: e.target.value },
                        }))
                      }
                      placeholder="support@labdhiherbs.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] text-xs"
                    />
                  </div>

                  {/* Location Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Workshop / Location</span>
                    </label>
                    <input
                      type="text"
                      value={config.announcementBar.locationText}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, locationText: e.target.value },
                        }))
                      }
                      placeholder="Surat, Gujarat"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] text-xs"
                    />
                  </div>

                  {/* Badge Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#B58A5A]" />
                      <span>Authenticity Badge</span>
                    </label>
                    <input
                      type="text"
                      value={config.announcementBar.badgeText}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, badgeText: e.target.value },
                        }))
                      }
                      placeholder="100% Authentic"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EFE9DD] focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Rotating Announcement Messages Ticker */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE9DD] pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                      Announcement Ticker Messages (Rotating Line)
                    </h3>
                    <p className="text-xs text-slate-500 font-light">
                      These messages rotate automatically every few seconds in the center of the hero line.
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#1F3A2E]">
                    {config.announcementBar.messages.length} Active Messages
                  </span>
                </div>

                {/* Messages List */}
                <div className="space-y-3">
                  {config.announcementBar.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      <input
                        type="text"
                        value={msg}
                        onChange={(e) => handleUpdateMessage(idx, e.target.value)}
                        className="flex-1 bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none"
                      />

                      <button
                        onClick={() => handleRemoveMessage(idx)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Message Input */}
                <div className="pt-2 flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
                    placeholder="Type new offer or announcement line (e.g. 🎁 Festive Offer: Buy 2 Get 1 Free)..."
                    className="flex-1 px-4 py-3 rounded-2xl border border-[#EFE9DD] bg-[#F8F6F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                  />

                  <button
                    onClick={handleAddMessage}
                    className="px-5 py-3 rounded-2xl bg-[#1F3A2E] text-white text-xs font-bold flex items-center gap-2 hover:bg-[#15271F] transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4 text-[#D4A373]" />
                    <span>Add Line</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2 CONTENT: Main Hero Section */}
          {activeTab === 'hero' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* CARD 1: Cinematic Video & Poster Media */}
              <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 space-y-6 shadow-xs">
                <div className="border-b border-[#EFE9DD] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#1A201C] flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-[#B58A5A]" />
                      <span>Cinematic Video & Media Assets</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                      Upload your high-definition brand video directly from your computer folder or select from library.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Hero Video Uploader */}
                  <VideoFolderPicker
                    value={config.heroSection.videoUrl || ''}
                    onChange={(url) =>
                      setConfig((prev) => ({
                        ...prev,
                        heroSection: { ...prev.heroSection, videoUrl: url },
                      }))
                    }
                    label="Hero Section Video (.mp4, .webm, .mov)"
                    helperText="Select or drag & drop a video file from your computer folder (supports up to 150MB)."
                  />

                  {/* Fallback Poster Image */}
                  <ImageFolderPicker
                    value={config.heroSection.posterUrl || ''}
                    onChange={(url) =>
                      setConfig((prev) => ({
                        ...prev,
                        heroSection: { ...prev.heroSection, posterUrl: url },
                      }))
                    }
                    label="Video Fallback Cover / Poster Image"
                    helperText="Displayed while video loads or on power-saver mobile screens."
                  />
                </div>
              </div>
            </motion.div>
          )}

        </main>

      </div>
    </div>
  );
}
