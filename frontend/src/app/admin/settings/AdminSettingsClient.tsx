'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import RichEditor from '../components/RichEditor';
import {
  Settings,
  User,
  Info,
  FileText,
  Shield,
  RotateCcw,
  Truck,
  HelpCircle,
  Copyright,
  Image as ImageIcon,
  Layout,
  Globe,
  Save,
  Plus,
  Trash2,
  Upload,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Link as LinkIcon,
  Star,
  GripVertical,
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}

interface SiteSettings {
  profile: {
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    address: string;
    country: string;
    state: string;
    city: string;
    profileImage: string;
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
  };
  aboutUs: { content: string };
  termsAndConditions: string;
  privacyPolicy: string;
  refundPolicy: string;
  shippingPolicy: string;
  faq: FaqItem[];
  copyrightText: string;
  copyrightYear: number;
  logoLight: string;
  logoDark: string;
  favicon: string;
  banners: Banner[];
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsLink: string;
  social: { facebook: string; instagram: string; twitter: string; youtube: string };
  // Operations & System Configuration (matching older website Site Setting)
  maintenanceMode: boolean;
  gstEnabled: boolean;
  igst: number;
  cgst: number;
  sgst: number;
  userLoginEnabled: boolean;
  paymentMode: string;
  reviewManagementEnabled: boolean;
  blogManagementEnabled: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

type ActiveTab =
  | 'profile'
  | 'about'
  | 'terms'
  | 'privacy'
  | 'refund'
  | 'shipping'
  | 'faq'
  | 'copyright'
  | 'logo'
  | 'banners'
  | 'site';

// ─── API Base ─────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ─── Toast notification component ─────────────────────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all animate-in slide-in-from-top-4 ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Shared card ──────────────────────────────────────────────────────────────
function SettingsCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#EFE9DD] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#EFE9DD] bg-[#F8F6F0]">
        <div className="p-2 bg-[#1F3A2E]/10 rounded-xl">
          <Icon className="w-4 h-4 text-[#1F3A2E]" />
        </div>
        <h2 className="font-bold text-[#1A201C] text-sm">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Input helpers ────────────────────────────────────────────────────────────
function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3.5 py-2.5 text-sm bg-[#F8F6F0] border border-[#EFE9DD] rounded-xl text-[#1A201C] focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]/30 focus:border-[#1F3A2E] transition-all placeholder-slate-400';

const textareaCls = inputCls + ' resize-none';

// ─── Save button ──────────────────────────────────────────────────────────────
function SaveButton({
  onClick,
  loading,
  label = 'Save Changes',
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <div className="flex justify-end pt-4 border-t border-[#EFE9DD]">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#1F3A2E] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5441] disabled:opacity-60 transition-all shadow-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {loading ? 'Saving...' : label}
      </button>
    </div>
  );
}

// ─── Image Upload Helper ──────────────────────────────────────────────────────
function ImageUpload({
  label,
  value,
  onChange,
  hint,
  onError,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  onError?: (msg: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      const msg = 'File size exceeds 10MB limit.';
      if (onError) onError(msg);
      else alert(msg);
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const token = getToken();

      let res = await fetch(`${API}/v1/upload/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        res = await fetch(`${API}/v1/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
      }

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        const errorMsg = data.message || 'Image upload failed. Please check file format.';
        if (onError) onError(errorMsg);
        else alert(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Network error during upload. Please try again.';
      if (onError) onError(errorMsg);
      else alert(errorMsg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="flex gap-3 items-center">
        {value && (
          <div className="w-16 h-16 rounded-xl border border-[#EFE9DD] overflow-hidden bg-[#F8F6F0] flex-shrink-0">
            <img
              src={value.startsWith('http') ? value : `http://localhost:5000${value}`}
              alt="preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1F3A2E] text-white rounded-xl text-xs font-bold hover:bg-[#15271F] transition-colors cursor-pointer shadow-xs"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 text-[#D4A373]" />
              )}
              {uploading
                ? 'Uploading from folder...'
                : value
                ? 'Change Photo from Folder'
                : 'Upload Photo from Folder'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-[#EFE9DD] transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {value && <p className="text-[11px] text-slate-400 font-mono truncate max-w-sm">{value}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}


// ─── Sidebar tab item ──────────────────────────────────────────────────────────
function TabItem({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: (id: ActiveTab) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
        active
          ? 'bg-[#1F3A2E] text-[#D4A373] shadow-sm'
          : 'text-slate-600 hover:bg-[#F8F6F0] hover:text-[#1F3A2E]'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#D4A373]' : 'text-slate-400'}`} />
      <span>{label}</span>
    </button>
  );
}

// ─── FAQ item row ─────────────────────────────────────────────────────────────
function FaqRow({
  item,
  index,
  onChange,
  onDelete,
}: {
  item: FaqItem;
  index: number;
  onChange: (i: number, field: keyof FaqItem, value: string | boolean | number) => void;
  onDelete: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-[#EFE9DD] rounded-xl overflow-hidden ${item.isActive ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F6F0]">
        <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
        <span className="text-xs font-bold text-slate-500 w-5">#{index + 1}</span>
        <p className="flex-1 text-sm font-semibold text-[#1A201C] truncate">{item.question || 'New FAQ Item'}</p>
        <button
          onClick={() => onChange(index, 'isActive', !item.isActive)}
          className="p-1.5 rounded-lg hover:bg-[#EFE9DD] transition-colors"
          title={item.isActive ? 'Deactivate' : 'Activate'}
        >
          {item.isActive ? (
            <Eye className="w-4 h-4 text-emerald-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <button
          onClick={() => onDelete(index)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-[#EFE9DD] transition-colors"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3 bg-white">
          <FormField label="Question">
            <input
              type="text"
              value={item.question}
              onChange={(e) => onChange(index, 'question', e.target.value)}
              className={inputCls}
              placeholder="Enter question..."
            />
          </FormField>
          <FormField label="Answer">
            <textarea
              value={item.answer}
              onChange={(e) => onChange(index, 'answer', e.target.value)}
              rows={3}
              className={textareaCls}
              placeholder="Enter answer..."
            />
          </FormField>
        </div>
      )}
    </div>
  );
}

// ─── Banner row ───────────────────────────────────────────────────────────────
function BannerRow({
  banner,
  index,
  onChange,
  onDelete,
}: {
  banner: Banner;
  index: number;
  onChange: (i: number, field: keyof Banner, value: string | boolean | number) => void;
  onDelete: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-[#EFE9DD] rounded-xl overflow-hidden ${banner.isActive ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F6F0]">
        {banner.image && (
          <img
            src={banner.image.startsWith('http') ? banner.image : `http://localhost:5000${banner.image}`}
            alt=""
            className="w-10 h-10 rounded-lg object-cover border border-[#EFE9DD]"
          />
        )}
        <p className="flex-1 text-sm font-semibold text-[#1A201C] truncate">{banner.title || 'New Banner'}</p>
        <button
          onClick={() => onChange(index, 'isActive', !banner.isActive)}
          className="p-1.5 rounded-lg hover:bg-[#EFE9DD] transition-colors"
        >
          {banner.isActive ? (
            <Eye className="w-4 h-4 text-emerald-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <button
          onClick={() => onDelete(index)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg hover:bg-[#EFE9DD] transition-colors">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {open && (
        <div className="px-4 pb-4 pt-2 space-y-3 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Title">
              <input
                type="text"
                value={banner.title}
                onChange={(e) => onChange(index, 'title', e.target.value)}
                className={inputCls}
                placeholder="Banner title"
              />
            </FormField>
            <FormField label="Subtitle">
              <input
                type="text"
                value={banner.subtitle}
                onChange={(e) => onChange(index, 'subtitle', e.target.value)}
                className={inputCls}
                placeholder="Subtitle / tagline"
              />
            </FormField>
          </div>
          <ImageUpload
            label="Banner Image"
            value={banner.image}
            onChange={(url) => onChange(index, 'image', url)}
            hint="Recommended: 1200×400px"
          />
          <FormField label="Link URL">
            <input
              type="text"
              value={banner.link}
              onChange={(e) => onChange(index, 'link', e.target.value)}
              className={inputCls}
              placeholder="/shop or https://..."
            />
          </FormField>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function AdminSettingsClient() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const defaultSettings: SiteSettings = {
    profile: {
      adminName: 'admin',
      adminEmail: 'support@labdhiherbs.com',
      adminPhone: '+91 93283 49328',
      address: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
      country: 'India',
      state: 'Gujarat',
      city: 'Surat',
      profileImage: '',
      facebook: 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage',
      instagram: 'https://www.instagram.com/labdhiherbs/',
      youtube: '',
      twitter: '',
    },
    aboutUs: { content: '' },
    termsAndConditions: '',
    privacyPolicy: '',
    refundPolicy: '',
    shippingPolicy: '',
    faq: [],
    copyrightText: '© 2025 Labdhi Herbs. All rights reserved.',
    copyrightYear: 2025,
    logoLight: '',
    logoDark: '',
    favicon: '',
    banners: [],
    siteName: 'Labdhi Herbs',
    siteTagline: '',
    supportEmail: 'support@labdhiherbs.com',
    supportPhone: '',
    whatsappNumber: '',
    address: '',
    city: 'Surat',
    state: 'Gujarat',
    pincode: '',
    googleMapsLink: '',
    social: { facebook: '', instagram: '', twitter: '', youtube: '' },
    maintenanceMode: false,
    gstEnabled: true,
    igst: 18,
    cgst: 9,
    sgst: 9,
    userLoginEnabled: true,
    paymentMode: 'both',
    reviewManagementEnabled: true,
    blogManagementEnabled: true,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  };

  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // Fetch settings
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetch(`${API}/v1/site-settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setSettings({ ...defaultSettings, ...d.data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Generic field update helpers
  const setField = useCallback(<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setProfileField = useCallback(<K extends keyof SiteSettings['profile']>(
    key: K,
    value: SiteSettings['profile'][K]
  ) => {
    setSettings((prev) => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  }, []);

  const setSocialField = useCallback(<K extends keyof SiteSettings['social']>(
    key: K,
    value: string
  ) => {
    setSettings((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }, []);

  // FAQ helpers
  const updateFaqItem = useCallback(
    (index: number, field: keyof FaqItem, value: string | boolean | number) => {
      setSettings((prev) => {
        const faq = [...prev.faq];
        faq[index] = { ...faq[index], [field]: value };
        return { ...prev, faq };
      });
    },
    []
  );
  const addFaqItem = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      faq: [
        ...prev.faq,
        { question: '', answer: '', order: prev.faq.length + 1, isActive: true },
      ],
    }));
  }, []);
  const deleteFaqItem = useCallback((index: number) => {
    setSettings((prev) => ({
      ...prev,
      faq: prev.faq.filter((_, i) => i !== index),
    }));
  }, []);

  // Banner helpers
  const updateBannerItem = useCallback(
    (index: number, field: keyof Banner, value: string | boolean | number) => {
      setSettings((prev) => {
        const banners = [...prev.banners];
        banners[index] = { ...banners[index], [field]: value };
        return { ...prev, banners };
      });
    },
    []
  );
  const addBanner = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      banners: [
        ...prev.banners,
        {
          id: Math.random().toString(36).substr(2, 9),
          title: '',
          subtitle: '',
          image: '',
          link: '/shop',
          isActive: true,
          order: prev.banners.length + 1,
        },
      ],
    }));
  }, []);
  const deleteBanner = useCallback((index: number) => {
    setSettings((prev) => ({
      ...prev,
      banners: prev.banners.filter((_, i) => i !== index),
    }));
  }, []);

  // ── Section-specific save functions ─────────────────────────────────────────
  const save = useCallback(
    async (endpoint: string, body: object) => {
      setSaving(true);
      try {
        const res = await fetch(`${API}/v1/site-settings/${endpoint}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (data.success) {
          showToast('Settings saved successfully!', 'success');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('site-settings-updated'));
          }
        } else {
          showToast(data.message || 'Save failed', 'error');
        }
      } catch {
        showToast('Network error. Please try again.', 'error');
      } finally {
        setSaving(false);
      }
    },
    [showToast]
  );

  const saveProfile = () => save('profile', settings.profile);

  const handlePasswordChange = async () => {
    setPasswordMsg(null);
    if (!newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter a new password' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and Confirm password do not match' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = getToken();
      const res = await fetch(`${API}/v1/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
        showToast('Admin password updated successfully!', 'success');
      } else {
        setPasswordMsg({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUpdatingPassword(false);
    }
  };
  const saveAbout = () => save('about', settings.aboutUs);
  const saveTerms = () => save('policy/termsAndConditions', { content: settings.termsAndConditions });
  const savePrivacy = () => save('policy/privacyPolicy', { content: settings.privacyPolicy });
  const saveRefund = () => save('policy/refundPolicy', { content: settings.refundPolicy });
  const saveShipping = () => save('policy/shippingPolicy', { content: settings.shippingPolicy });
  const saveFaq = () => save('faq', settings.faq);
  const saveCopyright = () => save('copyright', { copyrightText: settings.copyrightText, copyrightYear: settings.copyrightYear });
  const saveLogos = () => {
    const activeLogo = settings.logoLight || settings.logoDark || '';
    save('logos', { logoLight: activeLogo, logoDark: activeLogo, favicon: settings.favicon || '' });
  };
  const saveBanners = () => save('banners', settings.banners);
  const saveSite = () =>
    save('general', {
      siteName: settings.siteName,
      siteTagline: settings.siteTagline,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      whatsappNumber: settings.whatsappNumber,
      address: settings.address,
      city: settings.city,
      state: settings.state,
      pincode: settings.pincode,
      googleMapsLink: settings.googleMapsLink,
      social: settings.social,
      maintenanceMode: settings.maintenanceMode,
      gstEnabled: settings.gstEnabled,
      igst: settings.igst,
      cgst: settings.cgst,
      sgst: settings.sgst,
      userLoginEnabled: settings.userLoginEnabled,
      paymentMode: settings.paymentMode,
      reviewManagementEnabled: settings.reviewManagementEnabled,
      blogManagementEnabled: settings.blogManagementEnabled,
      metaTitle: settings.metaTitle,
      metaDescription: settings.metaDescription,
      metaKeywords: settings.metaKeywords,
    });

  // Map tab → save action
  const saveActions: Record<ActiveTab, () => void> = {
    profile: saveProfile,
    about: saveAbout,
    terms: saveTerms,
    privacy: savePrivacy,
    refund: saveRefund,
    shipping: saveShipping,
    faq: saveFaq,
    copyright: saveCopyright,
    logo: saveLogos,
    banners: saveBanners,
    site: saveSite,
  };

  // Sidebar tabs config
  const tabs: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'refund', label: 'Refund Policy', icon: RotateCcw },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'copyright', label: 'Copyrights', icon: Copyright },
    { id: 'logo', label: 'Logo', icon: Star },
    { id: 'banners', label: 'Banners', icon: Layout },
    { id: 'site', label: 'Site Setting', icon: Globe },
  ];

  // ── Render tab content ───────────────────────────────────────────────────────
  const renderTab = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[#1F3A2E]" />
          <span className="ml-3 text-slate-500 font-medium">Loading settings...</span>
        </div>
      );
    }

    switch (activeTab) {
      // ── Profile ─────────────────────────────────────────────────────────────
      case 'profile':
        return (
          <div className="space-y-6">
            {/* ── 1. Profile Information / Contact Details ── */}
            <SettingsCard title="Profile & Contact Information" icon={User}>
              <div className="space-y-5">
                <div className="flex items-center gap-5 pb-5 border-b border-[#EFE9DD]">
                  <div className="w-20 h-20 rounded-2xl bg-[#1F3A2E]/10 border-2 border-[#EFE9DD] overflow-hidden flex items-center justify-center">
                    {settings.profile.profileImage ? (
                      <img
                        src={settings.profile.profileImage.startsWith('http') ? settings.profile.profileImage : `http://localhost:5000${settings.profile.profileImage}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-[#1F3A2E]/30" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1A201C]">{settings.profile.adminName || 'admin'}</h3>
                    <p className="text-sm text-slate-500">{settings.profile.adminEmail || 'support@labdhiherbs.com'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-[#1F3A2E]/10 text-[#1F3A2E] text-[11px] font-bold rounded-full">
                      Store Administrator
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Name">
                    <input
                      type="text"
                      value={settings.profile.adminName}
                      onChange={(e) => setProfileField('adminName', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. admin"
                    />
                  </FormField>

                  <FormField label="Email">
                    <input
                      type="email"
                      value={settings.profile.adminEmail}
                      onChange={(e) => setProfileField('adminEmail', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. support@labdhiherbs.com"
                    />
                  </FormField>

                  <FormField label="Contact / Phone Number">
                    <input
                      type="text"
                      value={settings.profile.adminPhone}
                      onChange={(e) => setProfileField('adminPhone', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. +91 93283 49328"
                    />
                  </FormField>

                  <FormField label="City">
                    <input
                      type="text"
                      value={settings.profile.city}
                      onChange={(e) => setProfileField('city', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Surat"
                    />
                  </FormField>

                  <FormField label="State">
                    <input
                      type="text"
                      value={settings.profile.state}
                      onChange={(e) => setProfileField('state', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Gujarat"
                    />
                  </FormField>

                  <FormField label="Country">
                    <input
                      type="text"
                      value={settings.profile.country}
                      onChange={(e) => setProfileField('country', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. India"
                    />
                  </FormField>
                </div>

                <FormField label="Address">
                  <textarea
                    rows={3}
                    value={settings.profile.address}
                    onChange={(e) => setProfileField('address', e.target.value)}
                    className={textareaCls}
                    placeholder="e.g. 40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009"
                  />
                </FormField>

                <ImageUpload
                  label="Profile Photo"
                  value={settings.profile.profileImage}
                  onChange={(url) => setProfileField('profileImage', url)}
                  hint="Upload a square profile photo. Recommended: 200×200px"
                />

                <SaveButton onClick={saveProfile} loading={saving} label="Save Profile Details" />
              </div>
            </SettingsCard>

            {/* ── 2. Social Media & Share Links (Matching Old Site's Share Section) ── */}
            <SettingsCard title="Social Media Links (Share)" icon={Globe}>
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  These social media links appear in the website footer and contact sections across the site.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Facebook Link">
                    <div className="relative">
                      <Facebook className="w-4 h-4 text-blue-600 absolute left-3 top-3.5" />
                      <input
                        type="url"
                        value={settings.profile.facebook}
                        onChange={(e) => setProfileField('facebook', e.target.value)}
                        className={`${inputCls} pl-9`}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </FormField>

                  <FormField label="Instagram Link">
                    <div className="relative">
                      <Instagram className="w-4 h-4 text-pink-600 absolute left-3 top-3.5" />
                      <input
                        type="url"
                        value={settings.profile.instagram}
                        onChange={(e) => setProfileField('instagram', e.target.value)}
                        className={`${inputCls} pl-9`}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </FormField>

                  <FormField label="YouTube Link">
                    <div className="relative">
                      <Youtube className="w-4 h-4 text-red-600 absolute left-3 top-3.5" />
                      <input
                        type="url"
                        value={settings.profile.youtube}
                        onChange={(e) => setProfileField('youtube', e.target.value)}
                        className={`${inputCls} pl-9`}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </FormField>

                  <FormField label="Twitter / X Link">
                    <div className="relative">
                      <Twitter className="w-4 h-4 text-sky-500 absolute left-3 top-3.5" />
                      <input
                        type="url"
                        value={settings.profile.twitter}
                        onChange={(e) => setProfileField('twitter', e.target.value)}
                        className={`${inputCls} pl-9`}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </FormField>
                </div>

                <SaveButton onClick={saveProfile} loading={saving} label="Save Social Links" />
              </div>
            </SettingsCard>

            {/* ── 3. Change Password (Matching Old Site's Password Section) ── */}
            <SettingsCard title="Change Password" icon={Shield}>
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Update your administrator account login password.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="New Password">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={inputCls}
                      placeholder="Minimum 6 characters"
                    />
                  </FormField>

                  <FormField label="Confirm Password">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputCls}
                      placeholder="Re-enter new password"
                    />
                  </FormField>
                </div>

                {passwordMsg && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    passwordMsg.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {passwordMsg.text}
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t border-[#EFE9DD]">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={updatingPassword}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1F3A2E] text-white text-sm font-semibold rounded-xl hover:bg-[#2d5441] disabled:opacity-60 transition-all shadow-sm cursor-pointer"
                  >
                    {updatingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </SettingsCard>
          </div>
        );

      // ── About Us ─────────────────────────────────────────────────────────────
      case 'about':
        return (
          <SettingsCard title="About Us" icon={Info}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                This content appears on the About Us page and in brand story sections.
              </p>
              <FormField label="About Us Content">
                <RichEditor
                  value={settings.aboutUs.content}
                  onChange={(v: string) => setField('aboutUs', { content: v })}
                />
              </FormField>
              <SaveButton onClick={saveAbout} loading={saving} />
            </div>
          </SettingsCard>
        );

      // ── Legal Policies ────────────────────────────────────────────────────────
      case 'terms':
        return (
          <SettingsCard title="Terms & Conditions" icon={FileText}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Displayed on the public Terms & Conditions page.</p>
              <RichEditor value={settings.termsAndConditions} onChange={(v: string) => setField('termsAndConditions', v)} />
              <SaveButton onClick={saveTerms} loading={saving} />
            </div>
          </SettingsCard>
        );

      case 'privacy':
        return (
          <SettingsCard title="Privacy Policy" icon={Shield}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Displayed on the public Privacy Policy page.</p>
              <RichEditor value={settings.privacyPolicy} onChange={(v: string) => setField('privacyPolicy', v)} />
              <SaveButton onClick={savePrivacy} loading={saving} />
            </div>
          </SettingsCard>
        );

      case 'refund':
        return (
          <SettingsCard title="Refund Policy" icon={RotateCcw}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Displayed on the public Refund & Return Policy page.</p>
              <RichEditor value={settings.refundPolicy} onChange={(v: string) => setField('refundPolicy', v)} />
              <SaveButton onClick={saveRefund} loading={saving} />
            </div>
          </SettingsCard>
        );

      case 'shipping':
        return (
          <SettingsCard title="Shipping Policy" icon={Truck}>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Displayed on the public Shipping Information page.</p>
              <RichEditor value={settings.shippingPolicy} onChange={(v: string) => setField('shippingPolicy', v)} />
              <SaveButton onClick={saveShipping} loading={saving} />
            </div>
          </SettingsCard>
        );

      // ── FAQ ──────────────────────────────────────────────────────────────────
      case 'faq':
        return (
          <SettingsCard title="Frequently Asked Questions" icon={HelpCircle}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {settings.faq.length} question{settings.faq.length !== 1 ? 's' : ''} · Click to expand &amp; edit
                </p>
                <button
                  onClick={addFaqItem}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1F3A2E]/10 text-[#1F3A2E] text-sm font-semibold rounded-xl hover:bg-[#1F3A2E] hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Question
                </button>
              </div>
              {settings.faq.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No FAQ items yet. Click &quot;Add Question&quot; to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settings.faq.map((item, i) => (
                    <FaqRow
                      key={i}
                      item={item}
                      index={i}
                      onChange={updateFaqItem}
                      onDelete={deleteFaqItem}
                    />
                  ))}
                </div>
              )}
              <SaveButton onClick={saveFaq} loading={saving} label="Save All FAQ" />
            </div>
          </SettingsCard>
        );

      // ── Copyright ────────────────────────────────────────────────────────────
      case 'copyright':
        return (
          <SettingsCard title="Copyrights" icon={Copyright}>
            <div className="space-y-5">
              <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#EFE9DD]">
                <p className="text-xs font-semibold text-slate-500 mb-1">Preview</p>
                <p className="text-sm text-slate-700">
                  {settings.copyrightText} — {settings.copyrightYear}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Copyright Text" hint="Appears in website footer">
                  <input
                    type="text"
                    value={settings.copyrightText}
                    onChange={(e) => setField('copyrightText', e.target.value)}
                    className={inputCls}
                    placeholder="© 2025 Labdhi Herbs. All rights reserved."
                  />
                </FormField>
                <FormField label="Copyright Year">
                  <input
                    type="number"
                    value={settings.copyrightYear}
                    onChange={(e) => setField('copyrightYear', parseInt(e.target.value) || 2025)}
                    className={inputCls}
                    min={2000}
                    max={2100}
                  />
                </FormField>
              </div>
              <SaveButton onClick={saveCopyright} loading={saving} />
            </div>
          </SettingsCard>
        );

      // ── Logo ─────────────────────────────────────────────────────────────────
      case 'logo': {
        const currentLogo = settings.logoLight || settings.logoDark || '';
        return (
          <SettingsCard title="Website Logo" icon={Star}>
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-[#EFE9DD] bg-white space-y-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DD]">
                  <div>
                    <h3 className="text-sm font-bold text-[#1A201C]">Brand Logo</h3>
                    <p className="text-xs text-slate-500">
                      This single logo will be displayed across your entire website header, footer, invoice, and admin panel.
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E]">
                    Official Logo
                  </span>
                </div>

                {/* Single Image Upload Control */}
                <ImageUpload
                  label="Upload Website Logo"
                  value={currentLogo}
                  onChange={(url) => {
                    setField('logoLight', url);
                    setField('logoDark', url);
                  }}
                  hint="Upload your official brand logo. Transparent PNG or SVG is recommended."
                />
              </div>

              <SaveButton onClick={saveLogos} loading={saving} label="Save Logo" />
            </div>
          </SettingsCard>
        );
      }

      // ── Banners ──────────────────────────────────────────────────────────────
      case 'banners':
        return (
          <SettingsCard title="Promotional Banners" icon={Layout}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {settings.banners.length} banner{settings.banners.length !== 1 ? 's' : ''} · Manage promotional hero banners for the shop
                </p>
                <button
                  onClick={addBanner}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1F3A2E]/10 text-[#1F3A2E] text-sm font-semibold rounded-xl hover:bg-[#1F3A2E] hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Banner
                </button>
              </div>
              {settings.banners.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layout className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No banners yet. Click &quot;Add Banner&quot; to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settings.banners.map((banner, i) => (
                    <BannerRow
                      key={banner.id || i}
                      banner={banner}
                      index={i}
                      onChange={updateBannerItem}
                      onDelete={deleteBanner}
                    />
                  ))}
                </div>
              )}
              <SaveButton onClick={saveBanners} loading={saving} label="Save All Banners" />
            </div>
          </SettingsCard>
        );

      // ── Site Settings ─────────────────────────────────────────────────────────
      case 'site':
        return (
          <div className="space-y-6">
            {/* Operations & System Configuration (matching older website Site Setting) */}
            <SettingsCard title="Store Operations & System Controls" icon={Shield}>
              <div className="space-y-5">
                <p className="text-xs text-slate-500">
                  Manage core website operation modes, user access controls, and shopping preferences.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Maintenance Mode */}
                  <div className="p-4 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1A201C]">Site Maintenance Mode</p>
                      <p className="text-[11px] text-slate-500">
                        {settings.maintenanceMode
                          ? 'Store is offline for visitors'
                          : 'Store is live and accessible'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField('maintenanceMode', !settings.maintenanceMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        settings.maintenanceMode
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {settings.maintenanceMode ? 'Maintenance ON' : 'Store Live'}
                    </button>
                  </div>

                  {/* User Login Enabled */}
                  <div className="p-4 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1A201C]">User Login & Registration</p>
                      <p className="text-[11px] text-slate-500">
                        {settings.userLoginEnabled
                          ? 'Customers can sign in and register'
                          : 'User logins are temporarily paused'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField('userLoginEnabled', !settings.userLoginEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        settings.userLoginEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {settings.userLoginEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Review Management */}
                  <div className="p-4 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1A201C]">Review Management</p>
                      <p className="text-[11px] text-slate-500">
                        {settings.reviewManagementEnabled
                          ? 'Customer reviews visible on products'
                          : 'Reviews hidden from storefront'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField('reviewManagementEnabled', !settings.reviewManagementEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        settings.reviewManagementEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {settings.reviewManagementEnabled ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  {/* Blog Management */}
                  <div className="p-4 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1A201C]">Blog & Articles Module</p>
                      <p className="text-[11px] text-slate-500">
                        {settings.blogManagementEnabled
                          ? 'Blog journal pages active'
                          : 'Blog sections hidden'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField('blogManagementEnabled', !settings.blogManagementEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        settings.blogManagementEnabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-400 text-white'
                      }`}
                    >
                      {settings.blogManagementEnabled ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* Payment Accept Mode */}
                <div className="p-4 rounded-xl border border-[#EFE9DD] bg-white space-y-2">
                  <label className="block text-xs font-bold text-[#1A201C]">
                    Payment Acceptance Mode (Matching Old Website)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Select how customers can checkout across the store.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {[
                      { id: 'both', label: 'Online & COD (Both)' },
                      { id: 'online', label: 'Online Payments Only' },
                      { id: 'cod', label: 'Cash On Delivery (COD) Only' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setField('paymentMode', mode.id)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                          settings.paymentMode === mode.id
                            ? 'bg-[#1F3A2E] text-[#D4A373] border-[#1F3A2E] shadow-xs'
                            : 'bg-[#F8F6F0] text-slate-600 border-[#EFE9DD] hover:bg-[#EFE9DD]'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* Taxation & GST Rates (matching older website Site Setting) */}
            <SettingsCard title="Taxation & GST Rates" icon={Globe}>
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#EFE9DD]">
                  <div>
                    <p className="text-xs font-bold text-[#1A201C]">Enable GST on Checkout</p>
                    <p className="text-[11px] text-slate-500">
                      Apply Indian Goods &amp; Services Tax during order checkout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField('gstEnabled', !settings.gstEnabled)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      settings.gstEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                    }`}
                  >
                    {settings.gstEnabled ? 'GST Active' : 'GST Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="IGST (%)" hint="Integrated GST for inter-state orders">
                    <input
                      type="number"
                      value={settings.igst}
                      onChange={(e) => setField('igst', parseFloat(e.target.value) || 0)}
                      className={inputCls}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </FormField>

                  <FormField label="CGST (%)" hint="Central GST for intra-state orders">
                    <input
                      type="number"
                      value={settings.cgst}
                      onChange={(e) => setField('cgst', parseFloat(e.target.value) || 0)}
                      className={inputCls}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </FormField>

                  <FormField label="SGST (%)" hint="State GST for Gujarat orders">
                    <input
                      type="number"
                      value={settings.sgst}
                      onChange={(e) => setField('sgst', parseFloat(e.target.value) || 0)}
                      className={inputCls}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </FormField>
                </div>
              </div>
            </SettingsCard>

            {/* General Info */}
            <SettingsCard title="General Store Information" icon={Globe}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Site Name">
                    <input type="text" value={settings.siteName} onChange={(e) => setField('siteName', e.target.value)} className={inputCls} placeholder="Labdhi Herbs" />
                  </FormField>
                  <FormField label="Tagline">
                    <input type="text" value={settings.siteTagline} onChange={(e) => setField('siteTagline', e.target.value)} className={inputCls} placeholder="Pure Ayurvedic Formulations..." />
                  </FormField>
                  <FormField label="Support Email">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="email" value={settings.supportEmail} onChange={(e) => setField('supportEmail', e.target.value)} className={inputCls + ' pl-9'} placeholder="support@labdhiherbs.com" />
                    </div>
                  </FormField>
                  <FormField label="Support Phone">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" value={settings.supportPhone} onChange={(e) => setField('supportPhone', e.target.value)} className={inputCls + ' pl-9'} placeholder="+91 XXXXX XXXXX" />
                    </div>
                  </FormField>
                  <FormField label="WhatsApp Number" hint="Include country code: +919XXXXXXXXX">
                    <input type="text" value={settings.whatsappNumber} onChange={(e) => setField('whatsappNumber', e.target.value)} className={inputCls} placeholder="+919328349328" />
                  </FormField>
                </div>
              </div>
            </SettingsCard>

            {/* Address */}
            <SettingsCard title="Address" icon={MapPin}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <FormField label="Street Address">
                    <input type="text" value={settings.address} onChange={(e) => setField('address', e.target.value)} className={inputCls} placeholder="Shop/Office address" />
                  </FormField>
                </div>
                <FormField label="City">
                  <input type="text" value={settings.city} onChange={(e) => setField('city', e.target.value)} className={inputCls} placeholder="Surat" />
                </FormField>
                <FormField label="State">
                  <input type="text" value={settings.state} onChange={(e) => setField('state', e.target.value)} className={inputCls} placeholder="Gujarat" />
                </FormField>
                <FormField label="Pin Code">
                  <input type="text" value={settings.pincode} onChange={(e) => setField('pincode', e.target.value)} className={inputCls} placeholder="395001" />
                </FormField>
                <FormField label="Google Maps Link">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="url" value={settings.googleMapsLink} onChange={(e) => setField('googleMapsLink', e.target.value)} className={inputCls + ' pl-9'} placeholder="https://maps.google.com/..." />
                  </div>
                </FormField>
              </div>
            </SettingsCard>

            {/* Social Media */}
            <SettingsCard title="Social Media Links" icon={Globe}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Facebook">
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <input type="url" value={settings.social.facebook} onChange={(e) => setSocialField('facebook', e.target.value)} className={inputCls + ' pl-9'} placeholder="https://facebook.com/..." />
                  </div>
                </FormField>
                <FormField label="Instagram">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                    <input type="url" value={settings.social.instagram} onChange={(e) => setSocialField('instagram', e.target.value)} className={inputCls + ' pl-9'} placeholder="https://instagram.com/..." />
                  </div>
                </FormField>
                <FormField label="Twitter / X">
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                    <input type="url" value={settings.social.twitter} onChange={(e) => setSocialField('twitter', e.target.value)} className={inputCls + ' pl-9'} placeholder="https://twitter.com/..." />
                  </div>
                </FormField>
                <FormField label="YouTube">
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <input type="url" value={settings.social.youtube} onChange={(e) => setSocialField('youtube', e.target.value)} className={inputCls + ' pl-9'} placeholder="https://youtube.com/..." />
                  </div>
                </FormField>
              </div>
            </SettingsCard>

            {/* SEO */}
            <SettingsCard title="SEO / Meta Tags" icon={FileText}>
              <div className="space-y-4">
                <FormField label="Meta Title" hint="Ideal length: 50–60 characters">
                  <input type="text" value={settings.metaTitle} onChange={(e) => setField('metaTitle', e.target.value)} className={inputCls} placeholder="Labdhi Herbs – Pure Ayurvedic Formulations" />
                </FormField>
                <FormField label="Meta Description" hint="Ideal length: 150–160 characters">
                  <textarea value={settings.metaDescription} onChange={(e) => setField('metaDescription', e.target.value)} rows={3} className={textareaCls} placeholder="Discover 100% natural Ayurvedic products..." />
                </FormField>
                <FormField label="Meta Keywords" hint="Comma-separated keywords">
                  <textarea value={settings.metaKeywords} onChange={(e) => setField('metaKeywords', e.target.value)} rows={2} className={textareaCls} placeholder="Ayurvedic herbs, natural skincare, hair care..." />
                </FormField>
              </div>
              <SaveButton onClick={saveSite} loading={saving} label="Save Site Settings" />
            </SettingsCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F6F0] font-sans overflow-hidden">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onToggleMobileMenu={() => setMobileOpen(true)} title="Settings" />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-[#1F3A2E]/10 rounded-2xl">
                  <Settings className="w-5 h-5 text-[#1F3A2E]" />
                </div>
                <h1 className="text-2xl font-bold text-[#1A201C] font-serif">Settings</h1>
              </div>
              <p className="text-sm text-slate-500 pl-[52px]">
                Manage your site profile, policies, FAQ, banners, logos, and general configuration
              </p>
            </div>

            {/* Settings Layout */}
            <div className="flex gap-6">

              {/* Left: Tab Sidebar */}
              <div className="w-52 shrink-0">
                <div className="bg-white rounded-2xl border border-[#EFE9DD] shadow-sm p-2 space-y-0.5 sticky top-0">
                  {tabs.map((tab) => (
                    <TabItem
                      key={tab.id}
                      id={tab.id}
                      label={tab.label}
                      icon={tab.icon}
                      active={activeTab === tab.id}
                      onClick={setActiveTab}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Tab Content */}
              <div className="flex-1 min-w-0">
                {renderTab()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
