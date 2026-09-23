'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import {
  getSubscribersList,
  getNewsletterSettings,
  updateNewsletterSettings,
  deleteSubscriber,
  resendSubscriberMessage,
  getExportSubscribersUrl,
  testEmailSettings,
} from '../../../services/api';
import {
  Mail,
  Phone,
  MessageCircle,
  User,
  Calendar,
  Tag,
  Trash2,
  RefreshCw,
  Download,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Send,
  Save,
  Copy,
  Check,
  Users,
  Inbox,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriberItem {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'active' | 'unsubscribed';
  discountCode: string;
  emailStatus: 'sent' | 'simulated' | 'failed' | 'disabled';
  whatsappStatus: 'sent' | 'pending' | 'failed' | 'disabled';
  lastContactedAt?: string;
  createdAt: string;
}

interface NewsletterConfig {
  adminNotificationEmail: string;
  adminWhatsAppNumber: string;
  defaultCouponCode: string;
  welcomeEmailSubject: string;
  welcomeEmailBody: string;
  whatsappMessageTemplate: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSenderName: string;
  autoSendEmail: boolean;
  autoSendWhatsApp: boolean;
  notifyAdmin: boolean;
  whatsappGatewayProvider?: string;
  whatsappApiUrl?: string;
  whatsappApiKey?: string;
  whatsappInstanceId?: string;
}

export default function AdminSubscribersClient() {
  const router = useRouter();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Active Tab: 'leads' | 'settings'
  const [activeTab, setActiveTab] = useState<'leads' | 'settings'>('leads');

  // Leads Data
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    totalActive: 0,
    totalUnsubscribed: 0,
  });

  // Settings Data
  const [settings, setSettings] = useState<NewsletterConfig>({
    adminNotificationEmail: 'support@labdhiherbs.com',
    adminWhatsAppNumber: '+919328349328',
    defaultCouponCode: 'WELCOME10',
    welcomeEmailSubject: '🌿 Welcome to Labdhi Herbs, {name}! Your 10% Discount Code: {couponCode}',
    welcomeEmailBody: '',
    whatsappMessageTemplate: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSenderName: 'Labdhi Herbs Authentic Ayurveda',
    autoSendEmail: true,
    autoSendWhatsApp: true,
    notifyAdmin: true,
    whatsappGatewayProvider: 'none',
    whatsappApiUrl: '',
    whatsappApiKey: '',
    whatsappInstanceId: '',
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // Live Test states
  const [testEmailInput, setTestEmailInput] = useState('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // Feedback notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Fetch Subscribers List
  const fetchSubscribers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getSubscribersList({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: 20,
      });

      if (res.success && res.data) {
        setSubscribers(res.data);
        if (res.meta) setPaginationMeta(res.meta);
      } else {
        showToast(res.message || 'Failed to load subscribers', 'error');
      }
    } catch (err: any) {
      showToast('Network error loading subscribers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, currentPage]);

  // 2. Fetch Newsletter Auto-responder Settings
  const fetchSettings = useCallback(async () => {
    try {
      const res = await getNewsletterSettings();
      if (res.success && res.data) {
        setSettings((prev) => ({
          ...prev,
          ...res.data,
          adminNotificationEmail:
            res.data.adminNotificationEmail || res.companyProfile?.adminEmail || prev.adminNotificationEmail,
          adminWhatsAppNumber:
            res.data.adminWhatsAppNumber || res.companyProfile?.whatsappNumber || prev.adminWhatsAppNumber,
        }));
        setSettingsLoaded(true);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    if (activeTab === 'settings' && !settingsLoaded) {
      fetchSettings();
    }
  }, [activeTab, settingsLoaded, fetchSettings]);

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await updateNewsletterSettings(settings);
      if (res.success) {
        showToast('Settings & Message templates saved successfully!');
      } else {
        showToast(res.message || 'Failed to save settings', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error saving settings', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle Delete Subscriber
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from subscribers?`)) return;

    setActionLoadingId(id);
    try {
      const res = await deleteSubscriber(id);
      if (res.success) {
        showToast(`${name} removed successfully`);
        fetchSubscribers();
      } else {
        showToast(res.message || 'Failed to remove subscriber', 'error');
      }
    } catch (err) {
      showToast('Error removing subscriber', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Re-send Message
  const handleResend = async (id: string, name: string) => {
    setActionLoadingId(id);
    try {
      const res = await resendSubscriberMessage(id);
      if (res.success) {
        showToast(`Message refreshed for ${name}`);
        if (res.whatsappUrl) {
          window.open(res.whatsappUrl, '_blank');
        }
      } else {
        showToast(res.message || 'Failed to re-dispatch message', 'error');
      }
    } catch (err) {
      showToast('Error re-dispatching message', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Helper to open 1-click WhatsApp message to customer from Admin
  const openWhatsAppChat = (subscriber: SubscriberItem) => {
    const rawDigits = subscriber.phone.replace(/\D/g, '');
    const formattedPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

    // Use the customized template configured by Admin!
    const template =
      settings.whatsappMessageTemplate ||
      '🌿 *Namaste {name} ji!*\n\nWelcome to the *Labdhi Herbs* family! We are truly delighted to have you with us.\n\n🎁 As a welcome gift, here is your exclusive *10% OFF* discount coupon for your first order:\n👉 Voucher Code: *{couponCode}*\n\n✨ Handcrafted 100% natural Ayurvedic care direct from Surat, Gujarat.\n🛍️ Shop now: https://labdhiherbs.com/shop\n\nIf you need any guidance selecting the right formulation for your hair, skin, or joints, feel free to reply right here!\n\n_— Team Labdhi Herbs_';

    const msg = template
      .replace(/\{name\}/gi, subscriber.name || 'Customer')
      .replace(/\{couponCode\}/gi, subscriber.discountCode || settings.defaultCouponCode || 'WELCOME10')
      .replace(/\{companyName\}/gi, 'Labdhi Herbs')
      .replace(/\{phone\}/gi, subscriber.phone || '');

    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(msg)}`, '_blank');
    showToast(`WhatsApp message opened for ${subscriber.name}!`);
  };

  // Test Email Handler
  const handleTestEmail = async () => {
    if (!testEmailInput || !testEmailInput.includes('@')) {
      showToast('Please enter a valid email address to receive test email', 'error');
      return;
    }
    setIsSendingTestEmail(true);
    try {
      const res = await testEmailSettings(testEmailInput, {
        host: settings.smtpHost,
        port: settings.smtpPort,
        user: settings.smtpUser,
        pass: settings.smtpPass,
        senderName: settings.smtpSenderName,
      });
      if (res.success) {
        showToast(res.message || 'Test email sent successfully!');
      } else {
        showToast(res.message || 'Failed to send test email', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'SMTP Test error', 'error');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Helper to insert variable tag into active template
  const insertTemplateTag = (tag: string, field: 'whatsapp' | 'emailSubject' | 'emailBody') => {
    if (field === 'whatsapp') {
      setSettings((prev) => ({
        ...prev,
        whatsappMessageTemplate: prev.whatsappMessageTemplate + ` {${tag}}`,
      }));
    } else if (field === 'emailSubject') {
      setSettings((prev) => ({
        ...prev,
        welcomeEmailSubject: prev.welcomeEmailSubject + ` {${tag}}`,
      }));
    } else if (field === 'emailBody') {
      setSettings((prev) => ({
        ...prev,
        welcomeEmailBody: prev.welcomeEmailBody + ` {${tag}}`,
      }));
    }
  };

  // Live preview message computation
  const liveWhatsAppPreview = (settings.whatsappMessageTemplate || '')
    .replace(/\{name\}/gi, 'Pooja Mehta')
    .replace(/\{couponCode\}/gi, settings.defaultCouponCode || 'WELCOME10')
    .replace(/\{companyName\}/gi, 'Labdhi Herbs')
    .replace(/\{phone\}/gi, '+91 98765 43210')
    .replace(/\{adminPhone\}/gi, settings.adminWhatsAppNumber || '+91 93283 49328');

  const liveEmailPreview = (settings.welcomeEmailBody || '')
    .replace(/\{name\}/gi, 'Pooja Mehta')
    .replace(/\{couponCode\}/gi, settings.defaultCouponCode || 'WELCOME10')
    .replace(/\{companyName\}/gi, 'Labdhi Herbs')
    .replace(/\{phone\}/gi, '+91 98765 43210')
    .replace(/\{adminPhone\}/gi, settings.adminWhatsAppNumber || '+91 93283 49328');

  const liveSubjectPreview = (settings.welcomeEmailSubject || '')
    .replace(/\{name\}/gi, 'Pooja Mehta')
    .replace(/\{couponCode\}/gi, settings.defaultCouponCode || 'WELCOME10')
    .replace(/\{companyName\}/gi, 'Labdhi Herbs');

  return (
    <div className="flex h-screen bg-[#F8F6F0] text-[#1A201C] overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <AdminHeader onToggleMobileMenu={() => setIsMobileSidebarOpen(true)} title="Subscribers & Leads" />

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold ${
                toast.type === 'success'
                  ? 'bg-[#14261E] text-white border border-[#D4A373]'
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
              ) : (
                <AlertCircle className="w-4 h-4 text-white" />
              )}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Page Title & Top Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EFE9DD] pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#B58A5A] font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Lead Generation &amp; Direct Marketing</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#14261E] tracking-tight">
                Subscribers &amp; WhatsApp Leads
              </h1>
              <p className="text-xs text-slate-500 font-light mt-0.5">
                Capture prospective customer leads from Footer &amp; Blog, dispatch automated welcome coupons, and chat directly on WhatsApp.
              </p>
            </div>

            {/* Export CSV Button */}
            <div className="flex items-center gap-2.5">
              <a
                href={getExportSubscribersUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white border border-[#EFE9DD] hover:border-[#1F3A2E] text-[#14261E] text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:bg-slate-50 active:scale-95"
                title="Download CSV spreadsheet of all customer leads"
              >
                <Download className="w-4 h-4 text-[#B58A5A]" />
                <span>Export Leads (CSV)</span>
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 border-b border-[#EFE9DD] pb-1">
            <button
              onClick={() => setActiveTab('leads')}
              className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'leads'
                  ? 'text-[#14261E]'
                  : 'text-slate-400 hover:text-[#14261E]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customer Leads ({paginationMeta.total})</span>
              {activeTab === 'leads' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-[#14261E] rounded-full"
                />
              )}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-[#14261E]'
                  : 'text-slate-400 hover:text-[#14261E]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Company &amp; Message Templates</span>
              {activeTab === 'settings' && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-[#14261E] rounded-full"
                />
              )}
            </button>
          </div>

          {/* TAB 1: LEADS & SUBSCRIBERS TABLE */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Total Captured Leads</span>
                    <Users className="w-4 h-4 text-[#1F3A2E]" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#14261E]">
                    {paginationMeta.total}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Active Subscribers</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-emerald-700">
                    {paginationMeta.totalActive}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>WhatsApp Ready</span>
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-serif font-bold text-[#14261E]">
                    {paginationMeta.totalActive}
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Default Gift Voucher</span>
                    <Tag className="w-4 h-4 text-[#D4A373]" />
                  </div>
                  <div className="text-xl font-mono font-bold text-[#B58A5A]">
                    {settings.defaultCouponCode || 'WELCOME10'}
                  </div>
                </div>
              </div>

              {/* Filters & Search Header */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by name, email, or WhatsApp phone..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-[#14261E] placeholder-slate-400 focus:outline-none focus:border-[#1F3A2E]"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-xs rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-[#14261E] focus:outline-none focus:border-[#1F3A2E] cursor-pointer"
                  >
                    <option value="all">All Subscribers</option>
                    <option value="active">Active Only</option>
                    <option value="unsubscribed">Unsubscribed</option>
                  </select>

                  <button
                    onClick={fetchSubscribers}
                    className="p-2 rounded-xl bg-[#F8F6F0] hover:bg-slate-200 text-[#14261E] transition-colors"
                    title="Refresh list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Subscribers Data Table */}
              <div className="rounded-2xl bg-white border border-[#EFE9DD] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#14261E]">
                    <thead className="bg-[#14261E] text-white uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Customer Lead</th>
                        <th className="py-3 px-4">WhatsApp &amp; Contact</th>
                        <th className="py-3 px-4">Coupon</th>
                        <th className="py-3 px-4">Delivery Status</th>
                        <th className="py-3 px-4">Subscribed Date</th>
                        <th className="py-3 px-4 text-right">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9DD]">
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="w-6 h-6 border-2 border-[#1F3A2E] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <span>Loading subscribers...</span>
                          </td>
                        </tr>
                      ) : subscribers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <span>No subscribers found matching your criteria.</span>
                          </td>
                        </tr>
                      ) : (
                        subscribers.map((item) => {
                          return (
                            <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Customer Name & Source */}
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] font-bold flex items-center justify-center shrink-0 uppercase text-xs">
                                    {item.name ? item.name.charAt(0) : 'U'}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 capitalize">
                                      Via {item.source ? item.source.replace(/_/g, ' ') : 'Website'}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* WhatsApp & Email */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                    <Phone className="w-3 h-3 text-emerald-600" />
                                    <span>{item.phone}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span>{item.email}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Discount Code */}
                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F8F6F0] border border-[#EFE9DD] font-mono text-[11px] font-bold text-[#14261E]">
                                  <Tag className="w-3 h-3 text-[#D4A373]" />
                                  {item.discountCode || 'WELCOME10'}
                                </span>
                              </td>

                              {/* Delivery Status */}
                              <td className="py-3.5 px-4">
                                <div className="space-y-1">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      item.emailStatus === 'sent'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : item.emailStatus === 'simulated'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    Email: {item.emailStatus}
                                  </span>
                                  <div>
                                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      WhatsApp Ready
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Subscribed Date */}
                              <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>

                              {/* Quick Actions */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Direct WhatsApp Action */}
                                  <button
                                    onClick={() => openWhatsAppChat(item)}
                                    className="px-2.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:shadow-sm"
                                    title="Send WhatsApp welcome message to this customer"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                    <span>Send WhatsApp</span>
                                  </button>

                                  {/* Re-send Auto Message */}
                                  <button
                                    onClick={() => handleResend(item._id, item.name)}
                                    disabled={actionLoadingId === item._id}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                    title="Re-dispatch welcome voucher message"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete Lead */}
                                  <button
                                    onClick={() => handleDelete(item._id, item.name)}
                                    disabled={actionLoadingId === item._id}
                                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                                    title="Delete lead"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {paginationMeta.pages > 1 && (
                  <div className="p-4 border-t border-[#EFE9DD] flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Page {paginationMeta.page} of {paginationMeta.pages} ({paginationMeta.total} leads)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 rounded-lg bg-[#F8F6F0] hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(paginationMeta.pages, p + 1))}
                        disabled={currentPage >= paginationMeta.pages}
                        className="px-3 py-1.5 rounded-lg bg-[#F8F6F0] hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COMPANY & MESSAGE AUTO-RESPONDER SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Card 1: Company Profile & Channels */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#B58A5A] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Company Sender &amp; Notification Configuration</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-[#14261E]">
                  Admin Contact &amp; Notification Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Configure where you want to receive new subscriber alerts and which company number represents Labdhi Herbs.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      Admin Notification Email
                    </label>
                    <input
                      type="email"
                      value={settings.adminNotificationEmail}
                      onChange={(e) =>
                        setSettings({ ...settings, adminNotificationEmail: e.target.value })
                      }
                      placeholder="e.g. support@labdhiherbs.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Admin receives lead capture notifications here.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      Company WhatsApp Number
                    </label>
                    <input
                      type="text"
                      value={settings.adminWhatsAppNumber}
                      onChange={(e) =>
                        setSettings({ ...settings, adminWhatsAppNumber: e.target.value })
                      }
                      placeholder="e.g. +91 93283 49328"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      WhatsApp sender phone used for customer direct replies.
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      Default Discount Coupon Code
                    </label>
                    <input
                      type="text"
                      value={settings.defaultCouponCode}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultCouponCode: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. WELCOME10"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs font-mono font-bold text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Assigned to new subscribers automatically.
                    </span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#EFE9DD]">
                  <label className="flex items-center gap-2.5 text-xs text-[#14261E] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSendEmail}
                      onChange={(e) => setSettings({ ...settings, autoSendEmail: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E] cursor-pointer"
                    />
                    <span>Auto-send Welcome Email</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#14261E] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSendWhatsApp}
                      onChange={(e) =>
                        setSettings({ ...settings, autoSendWhatsApp: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E] cursor-pointer"
                    />
                    <span>Generate WhatsApp Response</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-[#14261E] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyAdmin}
                      onChange={(e) => setSettings({ ...settings, notifyAdmin: e.target.checked })}
                      className="w-4 h-4 rounded text-[#1F3A2E] focus:ring-[#1F3A2E] cursor-pointer"
                    />
                    <span>Email Admin on New Lead</span>
                  </label>
                </div>
              </div>

              {/* Card 2: WhatsApp Message Template with Live Chat Bubble Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-[#EFE9DD] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Welcome Message Template</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Standard 1-Click WhatsApp Chat (Option A Active)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    This message will be personalized and prepared for WhatsApp delivery to the customer upon subscribing.
                  </p>

                  {/* Insertable Variable Tags */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Click to Insert Variable Tag:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {['name', 'couponCode', 'companyName', 'phone'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => insertTemplateTag(tag, 'whatsapp')}
                          className="px-2.5 py-1 rounded-lg bg-[#F8F6F0] hover:bg-emerald-50 hover:text-emerald-800 border border-[#EFE9DD] text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                        >
                          +{`{${tag}}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div className="space-y-1">
                    <textarea
                      rows={8}
                      value={settings.whatsappMessageTemplate}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsappMessageTemplate: e.target.value })
                      }
                      placeholder="Type WhatsApp message template here..."
                      className="w-full p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs font-mono text-[#14261E] focus:outline-none focus:border-[#1F3A2E] leading-relaxed"
                    />
                  </div>
                </div>

                {/* Live WhatsApp Chat Simulation Card */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-white/10 pb-3">
                      <MessageCircle className="w-4 h-4" />
                      <span>Live WhatsApp Chat Preview</span>
                    </div>

                    {/* WhatsApp Chat Bubble */}
                    <div className="bg-[#0b141a] p-3 rounded-2xl border border-white/10 space-y-2">
                      <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed whitespace-pre-wrap shadow-md">
                        {liveWhatsAppPreview}
                        <div className="text-right text-[9px] text-emerald-200/70 pt-1">
                          11:30 AM ✓✓
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center pt-4">
                    Preview uses sample customer name "Pooja Mehta". Real message will inject actual lead data.
                  </p>
                </div>
              </div>

              {/* Card 3: Welcome Email Auto-Responder Template */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Simple Text Editor */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#B58A5A] uppercase tracking-wider">
                      <Mail className="w-4 h-4" />
                      <span>Welcome Email Auto-Responder</span>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      ✨ Simple Plain Text (Zero HTML Required)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Write your email in normal sentences. The system will automatically convert it into a luxury, mobile-friendly Ayurvedic email template with header, coupon voucher card, and shop button.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#14261E] block">
                        Email Subject Line
                      </label>
                      <input
                        type="text"
                        value={settings.welcomeEmailSubject}
                        onChange={(e) =>
                          setSettings({ ...settings, welcomeEmailSubject: e.target.value })
                        }
                        placeholder="e.g. 🌿 Welcome to Labdhi Herbs, {name}! Your 10% Discount Code: {couponCode}"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 block">
                          Click to Insert Variable Tag:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {['name', 'couponCode', 'companyName', 'phone', 'adminPhone'].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => insertTemplateTag(tag, 'emailBody')}
                              className="px-2 py-0.5 rounded-lg bg-[#F8F6F0] hover:bg-emerald-50 hover:text-emerald-800 border border-[#EFE9DD] text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                            >
                              +{`{${tag}}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-[#14261E] block mb-1">
                          Email Message Content (Normal Plain Text)
                        </label>
                        <textarea
                          rows={9}
                          value={settings.welcomeEmailBody}
                          onChange={(e) =>
                            setSettings({ ...settings, welcomeEmailBody: e.target.value })
                          }
                          placeholder="Type your welcome email message here in normal text (No HTML tags needed)..."
                          className="w-full p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs font-sans text-[#14261E] focus:outline-none focus:border-[#1F3A2E] leading-relaxed"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        💡 Paragraphs and line breaks are automatically formatted. You can insert links like <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded">https://labdhiherbs.com/shop</code> and they will turn into clickable links automatically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Live Luxury Email Preview */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200 border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2 text-emerald-400 uppercase tracking-wider">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Email Preview</span>
                        </div>
                        <span className="text-[10px] font-normal text-slate-400">Recipient View</span>
                      </div>

                      {/* Mock Email Container */}
                      <div className="bg-[#F8F6F0] rounded-2xl overflow-hidden border border-[#EFE9DD] text-[#14261E] text-xs shadow-inner">
                        {/* Subject Bar */}
                        <div className="bg-[#ECE6D8] px-3.5 py-2 border-b border-[#E0D8C6] text-[11px] font-medium text-slate-700 truncate">
                          <span className="text-slate-500 font-bold">Subject:</span> {liveSubjectPreview}
                        </div>

                        {/* Branded Header */}
                        <div className="bg-[#14261E] text-white p-4 text-center">
                          <p className="text-sm font-bold tracking-wide">🌿 LABDHI HERBS</p>
                          <p className="text-[9px] text-[#D4A373] tracking-widest uppercase mt-0.5">Authentic Ayurvedic Wellness</p>
                        </div>

                        {/* Email Body */}
                        <div className="p-4 bg-white space-y-3">
                          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
                            {liveEmailPreview || 'Write your message on the left to see live preview here...'}
                          </div>

                          {/* Voucher Preview Card */}
                          <div className="bg-[#14261E] rounded-xl p-3 text-center text-white">
                            <p className="text-[9px] text-[#EFE9DD] uppercase tracking-wider">Exclusive First Order Gift</p>
                            <span className="inline-block mt-1 font-mono font-bold text-sm text-[#D4A373] tracking-widest px-3 py-1 bg-white/10 rounded-md border border-dashed border-[#D4A373]">
                              {settings.defaultCouponCode || 'WELCOME10'}
                            </span>
                            <p className="text-[9px] text-[#EFE9DD]/80 mt-1">Apply at checkout on labdhiherbs.com</p>
                          </div>

                          <div className="text-center pt-1">
                            <span className="inline-block bg-[#1F3A2E] text-white text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-xs">
                              Explore Botanical Formulations →
                            </span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#14261E] text-slate-400 text-[9px] text-center py-2 px-3 border-t border-[#1F3A2E]">
                          © {new Date().getFullYear()} Labdhi Herbs • Surat, Gujarat • Authentic Natural Formulations
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center pt-3">
                      This is how your customer sees the email in Gmail, Apple Mail, and Outlook.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Customer Welcome Email Server (Gmail / SMTP Delivery) */}
              <div className="p-6 rounded-3xl bg-white border border-[#EFE9DD] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    <Mail className="w-4 h-4" />
                    <span>Customer Welcome Email Server (Gmail / SMTP Delivery)</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Inbox Delivery
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your sender Gmail address and 16-character <strong>Google App Password</strong> so welcome discounts are delivered automatically to your customer&apos;s email inbox.
                  <br />
                  <strong className="text-slate-700">Quick Guide:</strong> Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">myaccount.google.com/apppasswords</a>, generate a 16-letter App Password, and paste it below.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      SMTP Host (Default: smtp.gmail.com)
                    </label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      SMTP Port (Default: 587)
                    </label>
                    <input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                      placeholder="587"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      Sender Brand Name
                    </label>
                    <input
                      type="text"
                      value={settings.smtpSenderName}
                      onChange={(e) => setSettings({ ...settings, smtpSenderName: e.target.value })}
                      placeholder="Labdhi Herbs Authentic Ayurveda"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#14261E] block">
                      Your Gmail / Sender Email
                    </label>
                    <input
                      type="text"
                      value={settings.smtpUser}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      placeholder="yourbrand@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-[#14261E] block">
                      16-Letter Google App Password
                    </label>
                    <input
                      type="password"
                      value={settings.smtpPass}
                      onChange={(e) => setSettings({ ...settings, smtpPass: e.target.value })}
                      placeholder="16-character Google App Password (e.g. abcd efgh ijkl mnop)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                  </div>
                </div>

                {/* Test Email Section */}
                <div className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-2 mt-2">
                  <span className="text-xs font-bold text-[#14261E] block">
                    Verify Email Connection Live:
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      value={testEmailInput}
                      onChange={(e) => setTestEmailInput(e.target.value)}
                      placeholder="Enter destination email for test (e.g. your email)"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-[#EFE9DD] text-xs text-[#14261E] focus:outline-none focus:border-[#1F3A2E]"
                    />
                    <button
                      type="button"
                      onClick={handleTestEmail}
                      disabled={isSendingTestEmail}
                      className="px-4 py-2 rounded-xl bg-[#14261E] hover:bg-[#1f3a2e] disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSendingTestEmail ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Testing SMTP...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#D4A373]" />
                          <span>Send Test Email</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Settings Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 rounded-xl bg-[#1F3A2E] hover:bg-[#15271F] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  {isSavingSettings ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-[#D4A373]" />
                      <span>Save All Message Templates &amp; Settings</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
