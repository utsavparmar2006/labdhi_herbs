export interface DatabaseHealth {
  status: string;
  connected: boolean;
  name: string;
  host: string;
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
  database: DatabaseHealth;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  mainCategory?: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  hoverImage?: string;
  tag?: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  usage: string;
  inStock?: boolean;
  featured?: boolean;
  images?: string[];
  videoUrl?: string;
  howToUseVideoUrl?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  mainCategoryId: string;
  image?: string;
  description?: string;
  itemCount?: number;
}

export interface MainCategory {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  status?: 'active' | 'inactive';
  order?: number;
  subCategories: SubCategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  itemCount: number;
  slug: string;
  href?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BlogPost {
  _id?: string;
  id: string;
  title: string;
  slug?: string;
  excerpt: string;
  content?: string;
  date: string;
  author: string;
  category: string;
  image: string;
  readTime: string;
  featured?: boolean;
  showOnHome?: boolean;
  status?: 'published' | 'draft';
  order?: number;
  tags?: string[];
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  comment: string;
  productUsed: string;
  verified: boolean;
  avatar?: string;
}

export interface AnnouncementBarConfig {
  enabled: boolean;
  phone: string;
  email: string;
  locationText: string;
  badgeText: string;
  messages: string[];
}

export interface HeroSectionConfig {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  description?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  videoUrl?: string;
  posterUrl?: string;
}

export interface HomePageConfigData {
  _id?: string;
  announcementBar: AnnouncementBarConfig;
  heroSection: HeroSectionConfig;
  updatedAt?: string;
}

export interface SuccessStory {
  _id?: string;
  id: string;
  storyType?: 'photo' | 'video';
  customer: string;
  location: string;
  title: string;
  formulation: string;
  productId?: string;
  duration?: string;
  rating: number;
  comment: string;
  beforeImage: string;
  afterImage: string;
  videoUrl?: string;
  videoPoster?: string;
  additionalVideos?: { url: string; poster?: string; label?: string }[];
  featured: boolean;
  verified: boolean;
  status: 'active' | 'inactive';
  order: number;
  mainCategory?: string;
  subCategory?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  sgst?: number;
  cgst?: number;
  total: number;
}

export interface OrderPayment {
  method: 'cod' | 'online';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: string;
}

export type OrderStatusType =
  | 'pending'
  | 'accepted'
  | 'dispatched'
  | 'in_transit'
  | 'delivered'
  | 'returned_by_customer'
  | 'cancelled_by_seller'
  | 'return_received'
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'cancelled';

export interface Order {
  _id?: string;
  orderId: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  couponCode?: string;
  payment: OrderPayment;
  deliveryName?: string; // Delivery By (e.g. DTDC, Delhivery, Tirupati, Speed Post)
  deliveryTrackId?: string; // Tracking Id
  orderStatus: OrderStatusType;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role?: string;
  createdAt?: string;
}

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type MinimumRequirementType = 'none' | 'amount' | 'quantity';
export type CouponStatus = 'active' | 'inactive';

export interface Coupon {
  _id: string;
  code: string;
  type: DiscountType;
  value: number;
  minimumRequirement: MinimumRequirementType;
  minAmount: number;
  minQuantity: number;
  onlinePaymentOnly: boolean;
  limitTotalUsage: boolean;
  totalUsageLimit?: number;
  usageCount: number;
  limitPerCustomer: boolean;
  usedBy?: string[];
  startDate: string;
  endDate: string;
  status: CouponStatus;
  showInList: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CouponValidationResult {
  code: string;
  type: DiscountType;
  value: number;
  discountAmount: number;
  description: string;
  onlinePaymentOnly: boolean;
}

