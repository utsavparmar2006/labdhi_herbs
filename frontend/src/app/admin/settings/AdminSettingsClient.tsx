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
  Pencil,
  Tag,
  Sparkles,
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
    footerDescription?: string;
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
  pageHeaders?: {
    shop: { title: string; subtitle: string };
    subCategories: { title: string; subtitle: string };
    stories: { title: string; subtitle: string };
    blog: { title: string; subtitle: string };
    about: { title: string; subtitle: string };
  };
  smtpConfig?: {
    senderEmail: string;
    senderName: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    enableOrderEmails: boolean;
  };
  deliveryCharges?: {
    enabled: boolean;
    gujaratCharge: number;
    outsideGujaratCharge: number;
    freeDeliveryThreshold: number;
    estimatedDeliveryGujarat: string;
    estimatedDeliveryOutsideGujarat: string;
  };
  currencies?: Array<{
    code: string;
    symbol: string;
    name: string;
    exchangeRate: number;
    isActive: boolean;
    isDefault?: boolean;
  }>;
  internationalShipping?: {
    enabled: boolean;
    defaultCharge: number;
    defaultFreeThreshold: number;
    zones: Array<{
      id: string;
      name: string;
      countries: string[];
      deliveryCharge: number;
      freeDeliveryThreshold: number;
      isActive: boolean;
    }>;
  };
}

type ActiveTab =
  | 'profile'
  | 'deliveryCharges'
  | 'international'
  | 'pageHeaders'
  | 'smtp'
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

// ─── Banner Card ──────────────────────────────────────────────────────────────
function BannerCard({
  banner,
  index,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  banner: Banner;
  index: number;
  onEdit: (i: number) => void;
  onToggleActive: (i: number) => void;
  onDelete: (i: number) => void;
}) {
  const imgSrc = banner.image
    ? banner.image.startsWith('http')
      ? banner.image
      : `http://localhost:5000${banner.image}`
    : '';

  return (
    <div
      className={`flex items-center gap-4 p-3.5 bg-white border border-[#EFE9DD] rounded-2xl shadow-xs transition-all hover:border-[#1F3A2E]/20 ${
        banner.isActive ? '' : 'opacity-65 bg-slate-50'
      }`}
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-xl border border-[#EFE9DD] overflow-hidden bg-[#F8F6F0] flex-shrink-0 flex items-center justify-center">
        {imgSrc ? (
          <img src={imgSrc} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-6 h-6 text-slate-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-[#1A201C] truncate">{banner.title || 'Untitled Banner'}</h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              banner.isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {banner.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {banner.subtitle && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{banner.subtitle}</p>
        )}
        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
          Link: <span className="text-[#1F3A2E]">{banner.link || '/shop'}</span>
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => onToggleActive(index)}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            banner.isActive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border-[#EFE9DD] bg-white text-slate-400 hover:bg-slate-100'
          }`}
          title={banner.isActive ? 'Hide banner' : 'Show banner'}
        >
          {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => onEdit(index)}
          className="p-2 rounded-xl border border-[#EFE9DD] bg-white text-slate-600 hover:text-[#1F3A2E] hover:border-[#1F3A2E] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
          title="Edit Banner"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(index)}
          className="p-2 rounded-xl border border-[#EFE9DD] bg-white text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
          title="Delete Banner"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
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

  // Email & SMTP State
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Banner Modal State
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBannerIndex, setEditingBannerIndex] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState<{
    id?: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
    isActive: boolean;
  }>({
    title: '',
    subtitle: '',
    image: '',
    link: '/shop',
    isActive: true,
  });

  // Currency & International Shipping States
  const [newCurrCode, setNewCurrCode] = useState('');
  const [newCurrSymbol, setNewCurrSymbol] = useState('');
  const [newCurrName, setNewCurrName] = useState('');
  const [newCurrRate, setNewCurrRate] = useState<number>(85);
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);

  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneCountries, setNewZoneCountries] = useState('');
  const [newZoneCharge, setNewZoneCharge] = useState<number>(1500);
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);

  const defaultSettings: SiteSettings = {
    profile: {
      adminName: 'admin',
      adminEmail: 'support@labdhiherbs.com',
      adminPhone: '+91 93283 49328',
      address: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
      country: 'India',
      state: 'Gujarat',
      city: 'Surat',
      footerDescription:
        'Pure Ayurvedic medicines, face packs, hair oils, skincare lotions, and authentic herbal wellness handcrafted in Surat, Gujarat.',
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
    pageHeaders: {
      shop: {
        title: 'Explore Our Herbal Collection',
        subtitle:
          'Handcrafted with 100% pure botanical extracts from Surat, Gujarat. Free from artificial dyes, parabens, and harsh chemicals.',
      },
      subCategories: {
        title: 'Targeted Herbal Formulations',
        subtitle:
          'Explore specialized remedies crafted for your specific skin, scalp, and wellness needs.',
      },
      stories: {
        title: 'Customer Stories & Transformations',
        subtitle:
          'Discover authentic video journeys, customer before & after results, and verified experiences of pure Gujarati Ayurveda.',
      },
      blog: {
        title: 'Knowledge for a Healthier, More Natural Life',
        subtitle:
          'Explore time-tested Ayurvedic routines, botanical ingredient guides, and hair, skin, and joint care wisdom from our Surat herbalists.',
      },
      about: {
        title: 'Pure Herbal Wisdom Handcrafted in Surat',
        subtitle:
          'Discover our journey of restoring authentic Ayurvedic self-care with 100% chemical-free hair, skin, and joint care formulations.',
      },
    },
    smtpConfig: {
      senderEmail: 'support@labdhiherbs.com',
      senderName: 'Labdhi Herbs Authentic Ayurveda',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      enableOrderEmails: true,
    },
    deliveryCharges: {
      enabled: true,
      gujaratCharge: 50,
      outsideGujaratCharge: 100,
      freeDeliveryThreshold: 0,
      estimatedDeliveryGujarat: '2-3 business days',
      estimatedDeliveryOutsideGujarat: '4-7 business days',
    },
    currencies: [
      { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 1, isActive: true, isDefault: true },
      { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 85, isActive: true, isDefault: false },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', exchangeRate: 23, isActive: true, isDefault: false },
      { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 110, isActive: true, isDefault: false },
      { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 92, isActive: true, isDefault: false },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 62, isActive: true, isDefault: false },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 56, isActive: true, isDefault: false },
    ],
    internationalShipping: {
      enabled: true,
      defaultCharge: 2200,
      defaultFreeThreshold: 0,
      zones: [
        {
          id: 'middle-east',
          name: 'Middle East & Gulf',
          countries: ['United Arab Emirates', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain'],
          deliveryCharge: 1200,
          freeDeliveryThreshold: 0,
          isActive: true,
        },
        {
          id: 'north-america',
          name: 'USA & Canada',
          countries: ['United States', 'Canada'],
          deliveryCharge: 1800,
          freeDeliveryThreshold: 0,
          isActive: true,
        },
        {
          id: 'europe-uk',
          name: 'UK & Europe',
          countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland'],
          deliveryCharge: 1600,
          freeDeliveryThreshold: 0,
          isActive: true,
        },
        {
          id: 'australasia',
          name: 'Australia & New Zealand',
          countries: ['Australia', 'New Zealand', 'Singapore'],
          deliveryCharge: 1700,
          freeDeliveryThreshold: 0,
          isActive: true,
        },
      ],
    },
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

  // Banner modal helpers
  const openAddBannerModal = useCallback(() => {
    setEditingBannerIndex(null);
    setBannerForm({
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      subtitle: '',
      image: '',
      link: '/shop',
      isActive: true,
    });
    setBannerModalOpen(true);
  }, []);

  const openEditBannerModal = useCallback(
    (index: number) => {
      const item = settings.banners[index];
      if (!item) return;
      setEditingBannerIndex(index);
      setBannerForm({
        id: item.id || Math.random().toString(36).substr(2, 9),
        title: item.title || '',
        subtitle: item.subtitle || '',
        image: item.image || '',
        link: item.link || '/shop',
        isActive: item.isActive !== false,
      });
      setBannerModalOpen(true);
    },
    [settings.banners]
  );

  const closeBannerModal = useCallback(() => {
    setBannerModalOpen(false);
    setEditingBannerIndex(null);
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

  const handleSaveBannerModal = useCallback(async () => {
    if (!bannerForm.title.trim()) {
      showToast('Please enter a banner title', 'error');
      return;
    }
    if (!bannerForm.image.trim()) {
      showToast('Please upload or select a banner image', 'error');
      return;
    }

    let updatedBanners: Banner[];
    if (editingBannerIndex !== null && editingBannerIndex >= 0) {
      updatedBanners = [...settings.banners];
      updatedBanners[editingBannerIndex] = {
        ...updatedBanners[editingBannerIndex],
        ...bannerForm,
      };
    } else {
      updatedBanners = [
        ...settings.banners,
        {
          id: bannerForm.id || Math.random().toString(36).substr(2, 9),
          ...bannerForm,
          order: settings.banners.length + 1,
        },
      ];
    }

    setSettings((prev) => ({ ...prev, banners: updatedBanners }));
    setBannerModalOpen(false);
    setEditingBannerIndex(null);
    await save('banners', updatedBanners);
  }, [bannerForm, editingBannerIndex, settings.banners, save, showToast]);

  const handleDeleteBanner = useCallback(
    async (index: number) => {
      if (!confirm('Are you sure you want to delete this banner?')) return;
      const updatedBanners = settings.banners.filter((_, i) => i !== index);
      setSettings((prev) => ({ ...prev, banners: updatedBanners }));
      await save('banners', updatedBanners);
    },
    [settings.banners, save]
  );

  const handleToggleBannerActive = useCallback(
    async (index: number) => {
      const updatedBanners = settings.banners.map((b, i) =>
        i === index ? { ...b, isActive: !b.isActive } : b
      );
      setSettings((prev) => ({ ...prev, banners: updatedBanners }));
      await save('banners', updatedBanners);
    },
    [settings.banners, save]
  );

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

  const savePageHeaders = () =>
    save('page-headers', settings.pageHeaders || defaultSettings.pageHeaders!);

  const saveSmtp = () =>
    save('smtp', settings.smtpConfig || defaultSettings.smtpConfig!);

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim() || !testEmailAddress.includes('@')) {
      showToast('Please enter a valid email address to receive the test bill', 'error');
      return;
    }
    setTestingEmail(true);
    try {
      const res = await fetch(`${API}/v1/site-settings/test-smtp`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          toEmail: testEmailAddress.trim(),
          smtpConfig: settings.smtpConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Test invoice email sent successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to send test email. Check your SMTP credentials.', 'error');
      }
    } catch {
      showToast('Network error while testing email connection', 'error');
    } finally {
      setTestingEmail(false);
    }
  };

  const setSmtpField = useCallback(
    (field: keyof NonNullable<SiteSettings['smtpConfig']>, val: any) => {
      setSettings((prev) => ({
        ...prev,
        smtpConfig: {
          ...(prev.smtpConfig || defaultSettings.smtpConfig!),
          [field]: val,
        },
      }));
    },
    []
  );

  const setPageHeaderField = useCallback(
    (pageKey: 'shop' | 'subCategories' | 'stories' | 'blog' | 'about', field: 'title' | 'subtitle', val: string) => {
      setSettings((prev) => ({
        ...prev,
        pageHeaders: {
          shop: prev.pageHeaders?.shop || defaultSettings.pageHeaders!.shop,
          subCategories: prev.pageHeaders?.subCategories || defaultSettings.pageHeaders!.subCategories,
          stories: prev.pageHeaders?.stories || defaultSettings.pageHeaders!.stories,
          blog: prev.pageHeaders?.blog || defaultSettings.pageHeaders!.blog,
          about: prev.pageHeaders?.about || defaultSettings.pageHeaders!.about,
          [pageKey]: {
            ...(prev.pageHeaders?.[pageKey] || defaultSettings.pageHeaders![pageKey]),
            [field]: val,
          },
        },
      }));
    },
    []
  );

  const setDeliveryField = useCallback(
    (field: keyof NonNullable<SiteSettings['deliveryCharges']>, val: any) => {
      setSettings((prev) => ({
        ...prev,
        deliveryCharges: {
          ...(prev.deliveryCharges || defaultSettings.deliveryCharges!),
          [field]: val,
        },
      }));
    },
    []
  );

  const saveDeliveryCharges = () =>
    save('delivery-charges', settings.deliveryCharges || defaultSettings.deliveryCharges!);

  // Currency Handlers
  const setCurrencyRate = (code: string, newRate: number) => {
    setSettings((prev) => ({
      ...prev,
      currencies: (prev.currencies || defaultSettings.currencies!).map((c) =>
        c.code === code ? { ...c, exchangeRate: Math.max(0.001, newRate) } : c
      ),
    }));
  };

  const toggleCurrencyActive = (code: string) => {
    setSettings((prev) => ({
      ...prev,
      currencies: (prev.currencies || defaultSettings.currencies!).map((c) =>
        c.code === code ? { ...c, isActive: !c.isActive } : c
      ),
    }));
  };

  const addCustomCurrency = () => {
    if (!newCurrCode.trim()) {
      showToast('Please enter a currency code (e.g. SGD)', 'error');
      return;
    }
    const cleanCode = newCurrCode.trim().toUpperCase();
    const existing = settings.currencies || defaultSettings.currencies!;
    if (existing.some((c) => c.code === cleanCode)) {
      showToast(`Currency ${cleanCode} already exists`, 'error');
      return;
    }

    setSettings((prev) => ({
      ...prev,
      currencies: [
        ...(prev.currencies || defaultSettings.currencies!),
        {
          code: cleanCode,
          symbol: newCurrSymbol.trim() || '$',
          name: newCurrName.trim() || cleanCode,
          exchangeRate: Math.max(0.001, Number(newCurrRate) || 1),
          isActive: true,
          isDefault: false,
        },
      ],
    }));

    setNewCurrCode('');
    setNewCurrSymbol('');
    setNewCurrName('');
    setNewCurrRate(85);
    setShowAddCurrencyModal(false);
    showToast(`Added ${cleanCode} currency`, 'success');
  };

  const removeCurrency = (code: string) => {
    if (code === 'INR') {
      showToast('Indian Rupee (INR) is the base currency and cannot be deleted.', 'error');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      currencies: (prev.currencies || defaultSettings.currencies!).filter((c) => c.code !== code),
    }));
    showToast(`Removed currency ${code}`, 'success');
  };

  // International Shipping Handlers
  const setIntlShippingField = (field: 'enabled' | 'defaultCharge' | 'defaultFreeThreshold', val: any) => {
    setSettings((prev) => ({
      ...prev,
      internationalShipping: {
        ...(prev.internationalShipping || defaultSettings.internationalShipping!),
        [field]: val,
      },
    }));
  };

  const updateIntlZone = (
    zoneId: string,
    updates: Partial<{ name: string; countries: string[]; deliveryCharge: number; freeDeliveryThreshold: number; isActive: boolean }>
  ) => {
    setSettings((prev) => {
      const currentIntl = prev.internationalShipping || defaultSettings.internationalShipping!;
      return {
        ...prev,
        internationalShipping: {
          ...currentIntl,
          zones: currentIntl.zones.map((z) => (z.id === zoneId ? { ...z, ...updates } : z)),
        },
      };
    });
  };

  const addIntlZone = () => {
    if (!newZoneName.trim()) {
      showToast('Please enter zone name (e.g. Asia Pacific)', 'error');
      return;
    }
    const countryList = newZoneCountries
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (countryList.length === 0) {
      showToast('Please enter at least one country name for this zone', 'error');
      return;
    }

    const currentIntl = settings.internationalShipping || defaultSettings.internationalShipping!;
    const id = 'zone-' + Date.now();

    setSettings((prev) => ({
      ...prev,
      internationalShipping: {
        ...currentIntl,
        zones: [
          ...currentIntl.zones,
          {
            id,
            name: newZoneName.trim(),
            countries: countryList,
            deliveryCharge: Math.max(0, Number(newZoneCharge) || 0),
            freeDeliveryThreshold: 0,
            isActive: true,
          },
        ],
      },
    }));

    setNewZoneName('');
    setNewZoneCountries('');
    setNewZoneCharge(1500);
    setShowAddZoneModal(false);
    showToast(`Added shipping zone: ${newZoneName.trim()}`, 'success');
  };

  const deleteIntlZone = (zoneId: string) => {
    setSettings((prev) => {
      const currentIntl = prev.internationalShipping || defaultSettings.internationalShipping!;
      return {
        ...prev,
        internationalShipping: {
          ...currentIntl,
          zones: currentIntl.zones.filter((z) => z.id !== zoneId),
        },
      };
    });
    showToast('Shipping zone removed', 'success');
  };

  const saveCurrencies = () =>
    save('currencies', { currencies: settings.currencies || defaultSettings.currencies! });

  const saveInternationalShipping = () =>
    save('international-shipping', settings.internationalShipping || defaultSettings.internationalShipping!);

  const saveAllInternational = async () => {
    await save('currencies', { currencies: settings.currencies || defaultSettings.currencies! });
    await save('international-shipping', settings.internationalShipping || defaultSettings.internationalShipping!);
  };

  // Map tab → save action
  const saveActions: Record<ActiveTab, () => void> = {
    profile: saveProfile,
    deliveryCharges: saveDeliveryCharges,
    international: saveAllInternational,
    pageHeaders: savePageHeaders,
    smtp: saveSmtp,
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
    { id: 'deliveryCharges', label: 'Delivery Charges (India)', icon: Truck },
    { id: 'international', label: 'Global Currencies & Shipping', icon: Globe },
    { id: 'pageHeaders', label: 'Page Banners & Headers', icon: Layout },
    { id: 'smtp', label: 'Email & Invoicing', icon: Mail },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'refund', label: 'Refund Policy', icon: RotateCcw },
    { id: 'shipping', label: 'Shipping Policy (Text)', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'copyright', label: 'Copyrights', icon: Copyright },
    { id: 'logo', label: 'Logo', icon: Star },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
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

                <FormField label="Footer Brand Description">
                  <textarea
                    rows={3}
                    value={settings.profile.footerDescription || ''}
                    onChange={(e) => setProfileField('footerDescription', e.target.value)}
                    className={textareaCls}
                    placeholder="e.g. Pure Ayurvedic medicines, face packs, hair oils, skincare lotions, and authentic herbal wellness handcrafted in Surat, Gujarat."
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    This brand description is displayed under the logo in the website footer.
                  </p>
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

      // ── Delivery Charges (Gujarat vs Outside Gujarat) ─────────────────────────
      case 'deliveryCharges':
        const delivery = settings.deliveryCharges || defaultSettings.deliveryCharges!;
        const isDeliveryActive = delivery.enabled !== false;
        const gujCharge = Number(delivery.gujaratCharge ?? 50);
        const outsideCharge = Number(delivery.outsideGujaratCharge ?? 100);
        const freeThreshold = Number(delivery.freeDeliveryThreshold ?? 0);
        const sampleCart = 499;

        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-[#1F3A2E] text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-white/10 text-[#D4A373]">
                    <Truck className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-lg font-bold">Delivery Charges Setup</h3>
                </div>
                <p className="text-xs text-white/70 max-w-xl">
                  Configure separate shipping rates for Gujarat and Outside Gujarat (Rest of India). The checkout page automatically detects the customer&apos;s state and applies the correct delivery charge.
                </p>
              </div>
              <button
                type="button"
                onClick={saveDeliveryCharges}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4A373] text-[#14261E] text-sm font-bold rounded-xl hover:bg-[#c69262] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Delivery Rates'}
              </button>
            </div>

            {/* Master Toggle Card */}
            <SettingsCard title="System Delivery Status" icon={Shield}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD]">
                <div>
                  <h4 className="text-sm font-bold text-[#14261E]">Enable State-Wise Delivery Charges</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    When active, customers in Gujarat pay Gujarat rate, and customers outside Gujarat pay outside state rate. If disabled, all orders get free shipping.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveryField('enabled', !isDeliveryActive)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isDeliveryActive ? 'bg-[#1F3A2E]' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={isDeliveryActive}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isDeliveryActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </SettingsCard>

            {/* Rates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Zone 1: Within Gujarat */}
              <SettingsCard title="Zone 1: Within Gujarat (Local State)" icon={Truck}>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span>🌿</span> Surat &amp; All 33 Gujarat Districts
                    </span>
                    <span className="bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Local Shipping
                    </span>
                  </div>

                  <FormField
                    label="Gujarat Delivery Charge (₹)"
                    hint="Delivery charge in rupees added to orders shipping to Gujarat (e.g. 50, or 0 for free)"
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={delivery.gujaratCharge ?? 50}
                        onChange={(e) => setDeliveryField('gujaratCharge', Math.max(0, Number(e.target.value) || 0))}
                        className={`${inputCls} pl-8 font-semibold`}
                        placeholder="50"
                      />
                    </div>
                  </FormField>

                  <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#EFE9DD] text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-[#14261E]">📌 District Coverage:</p>
                    <p>Surat, Ahmedabad, Vadodara, Rajkot, Gandhinagar, Bhavnagar, Jamnagar, Junagadh, Anand, Navsari, Valsad, and all other Gujarat pin codes.</p>
                  </div>
                </div>
              </SettingsCard>

              {/* Zone 2: Outside Gujarat */}
              <SettingsCard title="Zone 2: Outside Gujarat (Rest of India)" icon={Globe}>
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <span>🇮🇳</span> National Inter-State Shipping
                    </span>
                    <span className="bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Interstate
                    </span>
                  </div>

                  <FormField
                    label="Outside Gujarat Delivery Charge (₹)"
                    hint="Delivery charge in rupees for Maharashtra, Rajasthan, Delhi, UP, MP, and all other states"
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={delivery.outsideGujaratCharge ?? 100}
                        onChange={(e) => setDeliveryField('outsideGujaratCharge', Math.max(0, Number(e.target.value) || 0))}
                        className={`${inputCls} pl-8 font-semibold`}
                        placeholder="100"
                      />
                    </div>
                  </FormField>

                  <div className="p-3 bg-[#F8F6F0] rounded-xl border border-[#EFE9DD] text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-[#14261E]">📌 National Courier Coverage:</p>
                    <p>Maharashtra, Rajasthan, Delhi NCR, Uttar Pradesh, Madhya Pradesh, Karnataka, Tamil Nadu, West Bengal, Bihar, Punjab, and all other Indian states.</p>
                  </div>
                </div>
              </SettingsCard>
            </div>

            {/* Free Delivery Threshold */}
            <SettingsCard title="Free Delivery Threshold (Optional Offer)" icon={Tag}>
              <div className="space-y-4">
                <FormField
                  label="Free Delivery on Orders Above (₹)"
                  hint="Enter a cart order amount (e.g. 999) to give 100% Free Delivery on higher-value orders. Enter 0 to always charge the zone rate."
                >
                  <div className="relative max-w-md">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={delivery.freeDeliveryThreshold ?? 0}
                      onChange={(e) => setDeliveryField('freeDeliveryThreshold', Math.max(0, Number(e.target.value) || 0))}
                      className={`${inputCls} pl-8 font-semibold`}
                      placeholder="0 (Disabled - Always charge)"
                    />
                  </div>
                </FormField>

                <p className="text-xs text-slate-500">
                  {freeThreshold > 0
                    ? `✅ Active Promotion: Customers ordering ₹${freeThreshold} or more will automatically receive FREE Delivery regardless of state.`
                    : 'ℹ️ No free shipping threshold set. Delivery charges will apply on all orders according to destination state.'}
                </p>
              </div>
            </SettingsCard>

            {/* Live Customer Simulation Card */}
            <SettingsCard title="Live Checkout Customer Simulator Preview" icon={Sparkles}>
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Here is an instant preview of what a customer sees at checkout when purchasing a sample product worth ₹{sampleCart}:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Preview Gujarat */}
                  <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-2">
                      <span className="text-xs font-bold text-[#14261E] flex items-center gap-1.5">
                        <span>🌿</span> Customer in Gujarat (Surat / Ahmedabad)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Gujarat
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Cart Subtotal:</span>
                        <strong className="text-slate-900 font-mono">₹{sampleCart}.00</strong>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>Delivery (Within Gujarat):</span>
                        <span className="font-mono text-[#1F3A2E]">
                          {!isDeliveryActive
                            ? 'FREE (Disabled)'
                            : freeThreshold > 0 && sampleCart >= freeThreshold
                            ? 'FREE (Offer Met)'
                            : `+ ₹${gujCharge}.00`}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#EFE9DD] pt-2 font-bold text-[#14261E] text-sm">
                        <span>Customer Total:</span>
                        <span className="font-mono text-base text-[#1F3A2E]">
                          ₹
                          {!isDeliveryActive || (freeThreshold > 0 && sampleCart >= freeThreshold)
                            ? sampleCart
                            : sampleCart + gujCharge}
                          .00
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preview Outside Gujarat */}
                  <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-2">
                      <span className="text-xs font-bold text-[#14261E] flex items-center gap-1.5">
                        <span>🇮🇳</span> Customer Outside Gujarat (Mumbai / Delhi)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Interstate
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-600">
                      <div className="flex justify-between">
                        <span>Cart Subtotal:</span>
                        <strong className="text-slate-900 font-mono">₹{sampleCart}.00</strong>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span>Delivery (Outside Gujarat):</span>
                        <span className="font-mono text-[#1F3A2E]">
                          {!isDeliveryActive
                            ? 'FREE (Disabled)'
                            : freeThreshold > 0 && sampleCart >= freeThreshold
                            ? 'FREE (Offer Met)'
                            : `+ ₹${outsideCharge}.00`}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-[#EFE9DD] pt-2 font-bold text-[#14261E] text-sm">
                        <span>Customer Total:</span>
                        <span className="font-mono text-base text-[#1F3A2E]">
                          ₹
                          {!isDeliveryActive || (freeThreshold > 0 && sampleCart >= freeThreshold)
                            ? sampleCart
                            : sampleCart + outsideCharge}
                          .00
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>

            <SaveButton
              onClick={saveDeliveryCharges}
              loading={saving}
              label="Save Delivery Charges"
            />
          </div>
        );

      // ── Global Currencies & International Shipping ─────────────────────────
      case 'international':
        const activeCurrencies = settings.currencies || defaultSettings.currencies!;
        const intlShipping = settings.internationalShipping || defaultSettings.internationalShipping!;
        const isIntlEnabled = intlShipping.enabled !== false;
        const flagMap: Record<string, string> = {
          INR: '🇮🇳',
          USD: '🇺🇸',
          AED: '🇦🇪',
          GBP: '🇬🇧',
          EUR: '🇪🇺',
          CAD: '🇨🇦',
          AUD: '🇦🇺',
        };

        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-[#1F3A2E] text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 rounded-lg bg-white/10 text-[#D4A373]">
                    <Globe className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif text-lg font-bold">Global Currencies &amp; International Shipping</h3>
                </div>
                <p className="text-xs text-white/70 max-w-xl">
                  Configure multi-currency conversion rates and zone-based international shipping for customers outside India. Foreign visitors are auto-detected with 100% free browser geo-detection.
                </p>
              </div>
              <button
                type="button"
                onClick={saveAllInternational}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4A373] text-[#14261E] text-sm font-bold rounded-xl hover:bg-[#c69262] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save All Global Settings'}
              </button>
            </div>

            {/* ── PART 1: Multi-Currency & Exchange Rates ── */}
            <SettingsCard title="Multi-Currency Management & Exchange Rates" icon={Globe}>
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <div>
                      <p className="font-bold">Zero-Cost Geography Auto-Detection Active</p>
                      <p className="text-[11px] text-emerald-800/80">
                        Visitor country is detected instantly in browser without any paid API subscriptions.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddCurrencyModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 text-white font-semibold rounded-lg text-xs hover:bg-emerald-900 transition-colors cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Currency</span>
                  </button>
                </div>

                {/* Currency Table */}
                <div className="overflow-x-auto rounded-xl border border-[#EFE9DD]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F8F6F0] text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-[#EFE9DD]">
                      <tr>
                        <th className="px-4 py-3">Currency</th>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3">Exchange Rate (1 Foreign Unit = X INR)</th>
                        <th className="px-4 py-3">Example Preview</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE9DD] bg-white">
                      {activeCurrencies.map((curr) => {
                        const flag = flagMap[curr.code] || '🌐';
                        const isINR = curr.code === 'INR';
                        const sampleINR = 850;
                        const previewVal = isINR ? '₹850' : `${curr.symbol}${(sampleINR / (curr.exchangeRate || 1)).toFixed(2)}`;

                        return (
                          <tr key={curr.code} className="hover:bg-stone-50/60 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{flag}</span>
                                <div>
                                  <span className="font-bold text-slate-900 font-mono">{curr.code}</span>
                                  <p className="text-[11px] text-slate-500">{curr.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-800">
                              {curr.symbol}
                            </td>
                            <td className="px-4 py-3">
                              {isINR ? (
                                <span className="text-slate-400 font-medium">1 INR (Base Currency)</span>
                              ) : (
                                <div className="flex items-center gap-2 max-w-[180px]">
                                  <span className="text-slate-500 font-bold text-[11px]">1 {curr.code} =</span>
                                  <div className="relative flex-1">
                                    <span className="absolute left-2.5 top-1.5 text-slate-400 font-bold text-[11px]">₹</span>
                                    <input
                                      type="number"
                                      min="0.01"
                                      step="0.1"
                                      value={curr.exchangeRate}
                                      onChange={(e) =>
                                        setCurrencyRate(curr.code, Math.max(0.001, Number(e.target.value) || 0))
                                      }
                                      className="w-full pl-6 pr-2 py-1 text-xs font-bold rounded-lg border border-[#EFE9DD] bg-[#F8F6F0] focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                                    />
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 font-mono text-[11px] text-emerald-800 font-medium">
                              ₹850 product → <strong className="text-slate-900">{previewVal}</strong>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isINR ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  Default
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleCurrencyActive(curr.code)}
                                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    curr.isActive !== false
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                  }`}
                                >
                                  {curr.isActive !== false ? 'Active' : 'Disabled'}
                                </button>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {!isINR && (
                                <button
                                  type="button"
                                  onClick={() => removeCurrency(curr.code)}
                                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete currency"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={saveCurrencies}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F3A2E] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5441] disabled:opacity-60 transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Exchange Rates</span>
                  </button>
                </div>
              </div>
            </SettingsCard>

            {/* ── PART 2: International Shipping Configuration & Zones ── */}
            <SettingsCard title="International Courier Delivery Setup" icon={Truck}>
              <div className="space-y-5">
                {/* Master Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD]">
                  <div>
                    <h4 className="text-sm font-bold text-[#14261E]">Enable Worldwide International Shipping</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      When enabled, foreign customers can select their destination country and pay via online international card gateway. Cash on Delivery (COD) is automatically restricted to domestic India.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIntlShippingField('enabled', !isIntlEnabled)}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isIntlEnabled ? 'bg-[#1F3A2E]' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={isIntlEnabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isIntlEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Default International Rate Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-[#EFE9DD] bg-white">
                  <FormField
                    label="Default International Delivery Charge (₹)"
                    hint="Fallback courier rate for countries not mapped into any specific custom zone"
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={intlShipping.defaultCharge ?? 2200}
                        onChange={(e) =>
                          setIntlShippingField('defaultCharge', Math.max(0, Number(e.target.value) || 0))
                        }
                        className={inputCls + ' pl-8 font-mono font-bold text-slate-800'}
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Global Free Shipping Threshold (₹)"
                    hint="Set 0 to always charge delivery fee, or e.g. 15000 for free worldwide shipping above this cart amount"
                  >
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={intlShipping.defaultFreeThreshold ?? 0}
                        onChange={(e) =>
                          setIntlShippingField('defaultFreeThreshold', Math.max(0, Number(e.target.value) || 0))
                        }
                        className={inputCls + ' pl-8 font-mono font-bold text-slate-800'}
                      />
                    </div>
                  </FormField>
                </div>

                {/* Shipping Zones List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Custom International Shipping Zones</h4>
                      <p className="text-xs text-slate-500">
                        Zone-specific pricing for high-volume regions (e.g. Gulf, North America, UK, Europe).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddZoneModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F3A2E] text-white font-semibold rounded-lg text-xs hover:bg-[#2d5441] transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Shipping Zone</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {intlShipping.zones.map((zone) => (
                      <div
                        key={zone.id}
                        className="p-4 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0]/60 space-y-3 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE9DD] pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                              <Truck className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              value={zone.name}
                              onChange={(e) => updateIntlZone(zone.id, { name: e.target.value })}
                              className="font-bold text-sm text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => updateIntlZone(zone.id, { isActive: zone.isActive === false })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                zone.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {zone.isActive !== false ? 'Active Zone' : 'Disabled'}
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteIntlZone(zone.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete zone"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Rate & Threshold row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Zone Delivery Fee (₹)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={zone.deliveryCharge}
                                onChange={(e) =>
                                  updateIntlZone(zone.id, {
                                    deliveryCharge: Math.max(0, Number(e.target.value) || 0),
                                  })
                                }
                                className="w-full pl-7 pr-3 py-1.5 text-xs font-bold rounded-lg border border-[#EFE9DD] bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Free Shipping Threshold (₹)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={zone.freeDeliveryThreshold ?? 0}
                                onChange={(e) =>
                                  updateIntlZone(zone.id, {
                                    freeDeliveryThreshold: Math.max(0, Number(e.target.value) || 0),
                                  })
                                }
                                className="w-full pl-7 pr-3 py-1.5 text-xs font-bold rounded-lg border border-[#EFE9DD] bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Countries tags */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Included Countries (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={zone.countries.join(', ')}
                            onChange={(e) =>
                              updateIntlZone(zone.id, {
                                countries: e.target.value
                                  .split(',')
                                  .map((c) => c.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#EFE9DD] bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            placeholder="e.g. United States, Canada"
                          />
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {zone.countries.map((c) => (
                              <span
                                key={c}
                                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={saveInternationalShipping}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1F3A2E] text-white text-xs font-semibold rounded-xl hover:bg-[#2d5441] disabled:opacity-60 transition-all shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save International Shipping</span>
                  </button>
                </div>
              </div>
            </SettingsCard>

            <SaveButton
              onClick={saveAllInternational}
              loading={saving}
              label="Save All Global Settings"
            />

            {/* Modal: Add New Currency */}
            {showAddCurrencyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif text-base font-bold text-stone-900">Add New Global Currency</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddCurrencyModal(false)}
                      className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Currency Code (3 letters)</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="e.g. SGD, NZD, KWD"
                        value={newCurrCode}
                        onChange={(e) => setNewCurrCode(e.target.value.toUpperCase())}
                        className={inputCls + ' font-mono'}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        placeholder="e.g. S$, NZ$, د.ك"
                        value={newCurrSymbol}
                        onChange={(e) => setNewCurrSymbol(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Currency Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Singapore Dollar"
                        value={newCurrName}
                        onChange={(e) => setNewCurrName(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Exchange Rate (1 Foreign Unit = X INR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">₹</span>
                        <input
                          type="number"
                          min="0.01"
                          step="0.1"
                          value={newCurrRate}
                          onChange={(e) => setNewCurrRate(Number(e.target.value))}
                          className={inputCls + ' pl-7 font-mono font-bold'}
                        />
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">
                        Example: If 1 SGD = 63 INR, enter 63.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAddCurrencyModal(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addCustomCurrency}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1F3A2E] text-white hover:bg-[#2d5441] shadow-xs cursor-pointer"
                    >
                      Add Currency
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add New Shipping Zone */}
            {showAddZoneModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="font-serif text-base font-bold text-stone-900">Add International Shipping Zone</h3>
                    <button
                      type="button"
                      onClick={() => setShowAddZoneModal(false)}
                      className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Zone Name</label>
                      <input
                        type="text"
                        placeholder="e.g. South East Asia"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Delivery Charge (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={newZoneCharge}
                          onChange={(e) => setNewZoneCharge(Number(e.target.value))}
                          className={inputCls + ' pl-7 font-mono font-bold'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Countries (Comma-separated)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Singapore, Malaysia, Thailand, Indonesia"
                        value={newZoneCountries}
                        onChange={(e) => setNewZoneCountries(e.target.value)}
                        className={textareaCls}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setShowAddZoneModal(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={addIntlZone}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1F3A2E] text-white hover:bg-[#2d5441] shadow-xs cursor-pointer"
                    >
                      Create Zone
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // ── Page Banners & Headers ───────────────────────────────────────────────
      case 'pageHeaders':
        const headers = settings.pageHeaders || defaultSettings.pageHeaders!;
        return (
          <div className="space-y-6">
            <div className="bg-[#1F3A2E] text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold">Page Header & Banner Manager</h3>
                <p className="text-xs text-white/70 mt-1 max-w-xl">
                  Customize the hero banner titles and subtitles displayed at the top of Shop, Sub-Categories, Success Stories, Blog, and About Us pages.
                </p>
              </div>
              <button
                type="button"
                onClick={savePageHeaders}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4A373] text-[#14261E] text-sm font-bold rounded-xl hover:bg-[#c69262] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save All Headers'}
              </button>
            </div>

            {/* 1. Shop Page Header */}
            <SettingsCard title="1. Shop Page Banner (/shop)" icon={Layout}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Header Title" hint="Main title shown in the dark hero header on /shop">
                    <input
                      type="text"
                      value={headers.shop?.title || ''}
                      onChange={(e) => setPageHeaderField('shop', 'title', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Explore Our Herbal Collection"
                    />
                  </FormField>
                  <FormField label="Subtitle / Tagline Description" hint="Subtext paragraph shown beneath the title">
                    <textarea
                      rows={2}
                      value={headers.shop?.subtitle || ''}
                      onChange={(e) => setPageHeaderField('shop', 'subtitle', e.target.value)}
                      className={textareaCls}
                      placeholder="e.g. Handcrafted with 100% pure botanical extracts from Surat, Gujarat..."
                    />
                  </FormField>
                </div>

                {/* Live Banner Preview */}
                <div className="mt-4 pt-4 border-t border-[#EFE9DD]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Shop Banner Preview</p>
                  <div className="rounded-xl bg-[#14261E] text-white p-6 text-center relative overflow-hidden border border-[#14261E]">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4A373] mb-1.5 font-semibold">Home &gt; Shop</div>
                    <h4 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
                      {headers.shop?.title || 'Explore Our Herbal Collection'}
                    </h4>
                    <p className="text-xs text-white/80 max-w-xl mx-auto line-clamp-2">
                      {headers.shop?.subtitle || 'Handcrafted with 100% pure botanical extracts...'}
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* 2. Sub-categories / Category Filter Page Header */}
            <SettingsCard title="2. Sub-Categories Page Banner (/shop/[category])" icon={Layout}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Header Title" hint="Header title shown when browsing categories and subcategories">
                    <input
                      type="text"
                      value={headers.subCategories?.title || ''}
                      onChange={(e) => setPageHeaderField('subCategories', 'title', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Targeted Herbal Formulations"
                    />
                  </FormField>
                  <FormField label="Subtitle / Tagline Description" hint="Description shown for categories and subcategories">
                    <textarea
                      rows={2}
                      value={headers.subCategories?.subtitle || ''}
                      onChange={(e) => setPageHeaderField('subCategories', 'subtitle', e.target.value)}
                      className={textareaCls}
                      placeholder="e.g. Explore specialized remedies crafted for your specific skin, scalp, and wellness needs."
                    />
                  </FormField>
                </div>

                {/* Live Banner Preview */}
                <div className="mt-4 pt-4 border-t border-[#EFE9DD]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Category Banner Preview</p>
                  <div className="rounded-xl bg-[#14261E] text-white p-6 text-center relative overflow-hidden border border-[#14261E]">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4A373] mb-1.5 font-semibold">Home &gt; Shop &gt; Category / Subcategory</div>
                    <h4 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
                      {headers.subCategories?.title || 'Targeted Herbal Formulations'}
                    </h4>
                    <p className="text-xs text-white/80 max-w-xl mx-auto line-clamp-2">
                      {headers.subCategories?.subtitle || 'Explore specialized remedies crafted for your specific skin, scalp, and wellness needs.'}
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* 3. Success Stories Page Header */}
            <SettingsCard title="3. Success Stories Page Banner (/stories & /gallery)" icon={Layout}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Header Title" hint="Main title shown on the Success Stories / Video Gallery page">
                    <input
                      type="text"
                      value={headers.stories?.title || ''}
                      onChange={(e) => setPageHeaderField('stories', 'title', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Customer Stories & Transformations"
                    />
                  </FormField>
                  <FormField label="Subtitle / Tagline Description" hint="Description shown under the stories header">
                    <textarea
                      rows={2}
                      value={headers.stories?.subtitle || ''}
                      onChange={(e) => setPageHeaderField('stories', 'subtitle', e.target.value)}
                      className={textareaCls}
                      placeholder="e.g. Discover authentic video journeys, customer before & after results, and verified experiences..."
                    />
                  </FormField>
                </div>

                {/* Live Banner Preview */}
                <div className="mt-4 pt-4 border-t border-[#EFE9DD]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Stories Banner Preview</p>
                  <div className="rounded-xl bg-[#14261E] text-white p-6 text-center relative overflow-hidden border border-[#14261E]">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4A373] mb-1.5 font-semibold">Home &gt; Stories & Reviews</div>
                    <h4 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
                      {headers.stories?.title || 'Customer Stories & Transformations'}
                    </h4>
                    <p className="text-xs text-white/80 max-w-xl mx-auto line-clamp-2">
                      {headers.stories?.subtitle || 'Discover authentic video journeys, customer before & after results, and verified experiences...'}
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* 4. Blog / Journal Page Header */}
            <SettingsCard title="4. Blog Page Banner (/blog)" icon={Layout}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Header Title" hint="Main title on the Blog / Ayurvedic Journal page">
                    <input
                      type="text"
                      value={headers.blog?.title || ''}
                      onChange={(e) => setPageHeaderField('blog', 'title', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Knowledge for a Healthier, More Natural Life"
                    />
                  </FormField>
                  <FormField label="Subtitle / Tagline Description" hint="Description under the blog hero title">
                    <textarea
                      rows={2}
                      value={headers.blog?.subtitle || ''}
                      onChange={(e) => setPageHeaderField('blog', 'subtitle', e.target.value)}
                      className={textareaCls}
                      placeholder="e.g. Explore time-tested Ayurvedic routines, botanical ingredient guides, and wellness wisdom..."
                    />
                  </FormField>
                </div>

                {/* Live Banner Preview */}
                <div className="mt-4 pt-4 border-t border-[#EFE9DD]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live Blog Banner Preview</p>
                  <div className="rounded-xl bg-[#14261E] text-white p-6 text-center relative overflow-hidden border border-[#14261E]">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4A373] mb-1.5 font-semibold">Home &gt; Ayurvedic Journal</div>
                    <h4 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
                      {headers.blog?.title || 'Knowledge for a Healthier, More Natural Life'}
                    </h4>
                    <p className="text-xs text-white/80 max-w-xl mx-auto line-clamp-2">
                      {headers.blog?.subtitle || 'Explore time-tested Ayurvedic routines, botanical ingredient guides, and wellness wisdom...'}
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            {/* 5. About Us Page Header */}
            <SettingsCard title="5. About Us Page Banner (/about)" icon={Layout}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField label="Header Title" hint="Hero banner title at the top of the About Us page">
                    <input
                      type="text"
                      value={headers.about?.title || ''}
                      onChange={(e) => setPageHeaderField('about', 'title', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Pure Herbal Wisdom Handcrafted in Surat"
                    />
                  </FormField>
                  <FormField label="Subtitle / Tagline Description" hint="Subtext paragraph shown on the About Us page hero">
                    <textarea
                      rows={2}
                      value={headers.about?.subtitle || ''}
                      onChange={(e) => setPageHeaderField('about', 'subtitle', e.target.value)}
                      className={textareaCls}
                      placeholder="e.g. Discover our journey of restoring authentic Ayurvedic self-care with 100% chemical-free formulations..."
                    />
                  </FormField>
                </div>

                {/* Live Banner Preview */}
                <div className="mt-4 pt-4 border-t border-[#EFE9DD]">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Live About Us Banner Preview</p>
                  <div className="rounded-xl bg-[#14261E] text-white p-6 text-center relative overflow-hidden border border-[#14261E]">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4A373] mb-1.5 font-semibold">Home &gt; About Us</div>
                    <h4 className="font-serif text-2xl font-bold tracking-tight text-white mb-2">
                      {headers.about?.title || 'Pure Herbal Wisdom Handcrafted in Surat'}
                    </h4>
                    <p className="text-xs text-white/80 max-w-xl mx-auto line-clamp-2">
                      {headers.about?.subtitle || 'Discover our journey of restoring authentic Ayurvedic self-care with 100% chemical-free formulations...'}
                    </p>
                  </div>
                </div>
              </div>
            </SettingsCard>

            <SaveButton onClick={savePageHeaders} loading={saving} label="Save All Page Headers" />
          </div>
        );

      // ── Email & SMTP Configuration ───────────────────────────────────────────
      case 'smtp':
        const smtp = settings.smtpConfig || defaultSettings.smtpConfig!;
        return (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-[#1F3A2E] text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold">Order Confirmation Email &amp; Invoicing</h3>
                <p className="text-xs text-white/70 mt-1 max-w-xl">
                  Configure the outgoing email address and SMTP server used to send branded order bills, tax invoices, and payment receipts to customers.
                </p>
              </div>
              <button
                type="button"
                onClick={saveSmtp}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4A373] text-[#14261E] text-sm font-bold rounded-xl hover:bg-[#c69262] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer shadow-md"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Email Settings'}
              </button>
            </div>

            {/* 1. Sender Identity & Automation Status */}
            <SettingsCard title="1. Sender Identity &amp; Notification Rules" icon={Mail}>
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-[#EFE9DD]">
                  <div>
                    <p className="text-xs font-bold text-[#1A201C]">Automatic Order Bill Dispatch</p>
                    <p className="text-[11px] text-slate-500">
                      Instantly send itemized invoice email to customer upon placing COD order or completing online payment
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSmtpField('enableOrderEmails', !smtp.enableOrderEmails)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      smtp.enableOrderEmails !== false ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                    }`}
                  >
                    {smtp.enableOrderEmails !== false ? 'Active (Auto-Send)' : 'Disabled'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Sender Email Address"
                    hint="The 'From' email address that customers see on their invoice"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={smtp.senderEmail || ''}
                        onChange={(e) => setSmtpField('senderEmail', e.target.value)}
                        className={`${inputCls} pl-9`}
                        placeholder="e.g. orders@labdhiherbs.com"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Sender Display Name"
                    hint="Brand title shown as the sender (e.g. Labdhi Herbs Authentic Ayurveda)"
                  >
                    <input
                      type="text"
                      value={smtp.senderName || ''}
                      onChange={(e) => setSmtpField('senderName', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. Labdhi Herbs Authentic Ayurveda"
                    />
                  </FormField>
                </div>
              </div>
            </SettingsCard>

            {/* 2. SMTP Server Credentials */}
            <SettingsCard title="2. SMTP Mail Server Credentials" icon={Shield}>
              <div className="space-y-5">
                <p className="text-xs text-slate-500">
                  Connect your mail server (Gmail, Google Workspace, AWS SES, Brevo, or cPanel SMTP) to send real delivery emails.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="SMTP Host / Server" hint="Default for Gmail is smtp.gmail.com">
                    <input
                      type="text"
                      value={smtp.smtpHost || ''}
                      onChange={(e) => setSmtpField('smtpHost', e.target.value)}
                      className={inputCls}
                      placeholder="smtp.gmail.com"
                    />
                  </FormField>

                  <FormField label="SMTP Port" hint="Standard ports: 587 (TLS/STARTTLS) or 465 (SSL)">
                    <input
                      type="number"
                      value={smtp.smtpPort || 587}
                      onChange={(e) => setSmtpField('smtpPort', Number(e.target.value) || 587)}
                      className={inputCls}
                      placeholder="587"
                    />
                  </FormField>

                  <FormField
                    label="SMTP Username / Account Email"
                    hint="Your full login email (e.g. yourname@gmail.com)"
                  >
                    <input
                      type="text"
                      value={smtp.smtpUser || ''}
                      onChange={(e) => setSmtpField('smtpUser', e.target.value)}
                      className={inputCls}
                      placeholder="e.g. labdhiherbs@gmail.com"
                    />
                  </FormField>

                  <FormField
                    label="SMTP Password / App Password"
                    hint="For Gmail, use a 16-character App Password (not your personal password)"
                  >
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={smtp.smtpPass || ''}
                        onChange={(e) => setSmtpField('smtpPass', e.target.value)}
                        className={`${inputCls} pr-10`}
                        placeholder="••••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title={showSmtpPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormField>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    How to get a Gmail App Password:
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed pl-5">
                    1. Go to your <strong>Google Account Security</strong> settings (<a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="underline font-semibold">myaccount.google.com/security</a>).<br />
                    2. Enable <strong>2-Step Verification</strong>.<br />
                    3. Under 2-Step Verification, select <strong>App Passwords</strong>, name it &quot;Labdhi Herbs&quot;, and copy the generated 16-letter password here.
                  </p>
                </div>
              </div>
            </SettingsCard>

            {/* 3. Live Email Test & Diagnostic */}
            <SettingsCard title="3. Test Email Dispatch" icon={CheckCircle2}>
              <div className="space-y-4">
                <p className="text-xs text-slate-500">
                  Send a test email to verify your SMTP configuration before enabling live customer dispatches.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      placeholder="Enter recipient email (e.g. your personal email)..."
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendTestEmail}
                    disabled={testingEmail}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1F3A2E] text-white text-xs font-bold rounded-xl hover:bg-[#2d5441] transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
                  >
                    {testingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {testingEmail ? 'Sending Test...' : 'Send Test Bill'}
                  </button>
                </div>
              </div>
            </SettingsCard>

            {/* 4. Live GST Bill & Inclusive Calculation Sample */}
            <SettingsCard title="4. GST Breakdown & Inclusive Tax Logic Preview" icon={Globe}>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  As configured, all product prices on the storefront are <strong>GST inclusive</strong> (e.g. ₹499 is the final customer price). The invoice calculates backward to declare the taxable base and exact tax amounts without adding extra fees to the customer:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Gujarat Intra-state Sample */}
                  <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-2">
                      <span className="text-xs font-bold text-[#14261E]">Gujarat Orders (CGST + SGST)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Intra-State
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Product MRP (Inclusive):</span>
                        <strong className="text-slate-900">₹499.00</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Taxable Base Value (499 / 1.18):</span>
                        <span>₹422.88</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>CGST ({settings.cgst ?? 9}%):</span>
                        <span>₹38.06</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>SGST ({settings.sgst ?? 9}%):</span>
                        <span>₹38.06</span>
                      </div>
                      <div className="flex justify-between border-t border-[#EFE9DD] pt-1.5 font-bold text-[#14261E]">
                        <span>Customer Bill Total:</span>
                        <span>₹499.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Other States Inter-state Sample */}
                  <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-2">
                      <span className="text-xs font-bold text-[#14261E]">Outside Gujarat (IGST)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Inter-State
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-slate-600">
                      <div className="flex justify-between">
                        <span>Product MRP (Inclusive):</span>
                        <strong className="text-slate-900">₹499.00</strong>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Taxable Base Value (499 / 1.18):</span>
                        <span>₹422.88</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>IGST ({settings.igst ?? 18}%):</span>
                        <span>₹76.12</span>
                      </div>
                      <div className="flex justify-between border-t border-[#EFE9DD] pt-1.5 font-bold text-[#14261E]">
                        <span>Customer Bill Total:</span>
                        <span>₹499.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SettingsCard>

            <SaveButton onClick={saveSmtp} loading={saving} label="Save Email &amp; Invoicing Settings" />
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
          <>
            <SettingsCard title="Promotional Banners" icon={Layout}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {settings.banners.length} banner{settings.banners.length !== 1 ? 's' : ''} · Manage promotional hero banners for the shop
                  </p>
                  <button
                    type="button"
                    onClick={openAddBannerModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1F3A2E] text-white text-sm font-semibold rounded-xl hover:bg-[#15271F] transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-[#D4A373]" />
                    Add Banner
                  </button>
                </div>
                {settings.banners.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border border-dashed border-[#EFE9DD] rounded-2xl bg-[#F8F6F0]/50">
                    <Layout className="w-10 h-10 mx-auto mb-3 opacity-30 text-[#1F3A2E]" />
                    <p className="text-sm font-medium text-[#1A201C]">No banners yet</p>
                    <p className="text-xs text-slate-400 mt-1">Click &quot;Add Banner&quot; above to create your first promotional banner.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {settings.banners.map((banner, i) => (
                      <BannerCard
                        key={banner.id || i}
                        banner={banner}
                        index={i}
                        onEdit={openEditBannerModal}
                        onToggleActive={handleToggleBannerActive}
                        onDelete={handleDeleteBanner}
                      />
                    ))}
                  </div>
                )}
                {settings.banners.length > 0 && (
                  <SaveButton onClick={saveBanners} loading={saving} label="Save All Banners" />
                )}
              </div>
            </SettingsCard>

            {/* Banner Add / Edit Modal */}
            {bannerModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EFE9DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="p-5 border-b border-[#EFE9DD] flex items-center justify-between bg-[#F8F6F0]">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1A201C]">
                        {editingBannerIndex !== null ? 'Edit Banner' : 'Add New Banner'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Set hero image, title, and link for store promotions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={closeBannerModal}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-5 space-y-4 overflow-y-auto">
                    <FormField label="Banner Title *">
                      <input
                        type="text"
                        required
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm((p) => ({ ...p, title: e.target.value }))}
                        className={inputCls}
                        placeholder="e.g. 100% Pure Botanical Formulations"
                      />
                    </FormField>

                    <FormField label="Subtitle / Tagline">
                      <input
                        type="text"
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm((p) => ({ ...p, subtitle: e.target.value }))}
                        className={inputCls}
                        placeholder="e.g. Handcrafted in Surat, Gujarat"
                      />
                    </FormField>

                    <ImageUpload
                      label="Banner Image *"
                      value={bannerForm.image}
                      onChange={(url) => setBannerForm((p) => ({ ...p, image: url }))}
                      hint="Recommended: 1200×400px (JPG, PNG, WebP)"
                    />

                    <FormField label="Link URL">
                      <input
                        type="text"
                        value={bannerForm.link}
                        onChange={(e) => setBannerForm((p) => ({ ...p, link: e.target.value }))}
                        className={inputCls}
                        placeholder="/shop or /product/slug"
                      />
                    </FormField>

                    <div className="flex items-center gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="banner-is-active"
                        checked={bannerForm.isActive}
                        onChange={(e) => setBannerForm((p) => ({ ...p, isActive: e.target.checked }))}
                        className="w-4 h-4 text-[#1F3A2E] rounded border-[#EFE9DD] focus:ring-[#1F3A2E] cursor-pointer"
                      />
                      <label htmlFor="banner-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer">
                        Display this banner on homepage (Active)
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-[#EFE9DD] bg-[#F8F6F0] flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={closeBannerModal}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-[#EFE9DD] rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBannerModal}
                      disabled={saving}
                      className="flex items-center gap-2 px-5 py-2 bg-[#1F3A2E] text-white text-xs font-bold rounded-xl hover:bg-[#15271F] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 text-[#D4A373]" />
                      )}
                      {editingBannerIndex !== null ? 'Save Changes' : 'Add Banner'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
