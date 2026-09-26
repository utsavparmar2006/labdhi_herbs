import { Product, Category, MainCategory, BlogPost, Testimonial } from '../types';

/**
 * Dynamic Categories & Products
 * Initialized as empty so the site displays ONLY real data from Admin Panel / MongoDB.
 */
export const MAIN_CATEGORIES: MainCategory[] = [];

export const CATEGORIES: Category[] = [];

export const PRODUCTS: Product[] = [];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'ancient-secrets-herbal-face-packs',
    title: 'The Ancient Secrets of Herbal Face Packs for Glowing Skin',
    excerpt: 'Discover how centuries-old Ayurvedic botanicals like Wild Turmeric and Sandalwood restore natural skin balance without harsh chemicals.',
    date: 'August 24, 2026',
    author: 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
    category: 'Skin Care',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    featured: true,
    showOnHome: true,
  },
  {
    id: 'combating-hair-fall-naturally',
    title: 'Root Nourishment: How Bhringraj & Amla Stop Hair Fall',
    excerpt: 'Understanding the science behind cold-pressed herbal oil infusion and why deep scalp massage accelerates dormant follicle activation.',
    date: 'August 18, 2026',
    author: 'Labdhi Herbs Wellness Team',
    category: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    featured: false,
    showOnHome: true,
  },
  {
    id: 'joint-mobility-and-herbal-balms',
    title: '5 Daily Ayurvedic Rituals for Healthy Joints & Muscle Mobility',
    excerpt: 'Simple daily warm-oil self-massage techniques to relieve joint stiffness and keep muscles flexible as seasons change.',
    date: 'August 10, 2026',
    author: 'Labdhi Herbs Research',
    category: 'Muscle & Joint Care',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    readTime: '5 min read',
    featured: false,
    showOnHome: true,
  },
  {
    id: 'ayurvedic-dinacharya-daily-wellness',
    title: 'Ayurvedic Dinacharya: 4 Simple Morning Habits for Daily Vitality',
    excerpt: 'How waking with the sun, tongue scraping, warm herbal water, and botanical nourishment balance Agni and boost all-day focus.',
    date: 'August 05, 2026',
    author: 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    featured: false,
    showOnHome: true,
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Patel',
    location: 'Surat, Gujarat',
    rating: 5,
    comment: 'The Herbal Kesh Sanjivani Hair Oil is magical! Hair fall reduced by 80% within 3 weeks. Authentic Gujarati Ayurveda at its finest.',
    productUsed: 'Herbal Kesh Sanjivani Hair Oil',
    verified: true,
  },
  {
    id: '2',
    name: 'Rajesh Shah',
    location: 'Ahmedabad, Gujarat',
    rating: 5,
    comment: 'Ortho-Relax Joint Oil gave my mother immense relief from knee pain. Truly pure chemical-free formulation. Highly recommend Labdhi Herbs.',
    productUsed: 'Ortho-Relax Joint & Muscle Oil',
    verified: true,
  },
  {
    id: '3',
    name: 'Meera Joshi',
    location: 'Vadodara, Gujarat',
    rating: 5,
    comment: 'Beautiction Face Pack cleared my acne spots completely. Smells natural and leaves skin glowing. Ordering my second tub today!',
    productUsed: 'Beautiction Face Pack',
    verified: true,
  },
];

export function getProductByIdOrSlug(idOrSlug: string): Product | null {
  if (!idOrSlug) return null;
  const match = PRODUCTS.find((p) => p.id.toLowerCase() === idOrSlug.toLowerCase());
  if (match) return match;
  return null;
}
