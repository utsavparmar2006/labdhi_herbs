import { Product, Category, MainCategory, BlogPost, Testimonial } from '../types';

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    id: 'all',
    name: 'All Formulations',
    slug: 'All',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    description: 'Explore our complete collection of authentic Ayurvedic formulations.',
    subCategories: [
      { id: 'all-sub', name: 'All Formulations', slug: 'All', mainCategoryId: 'all' },
    ],
  },
  {
    id: 'skin-face-care',
    name: 'Skin & Face Care',
    slug: 'Skin & Face Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    description: 'Botanical face packs, natural ointments & skin restoring elixirs.',
    subCategories: [
      {
        id: 'face-packs',
        name: 'Face Packs & Ubtan',
        slug: 'Face Packs & Ubtan',
        mainCategoryId: 'skin-face-care',
        image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800',
        description: 'Traditional multani mitti & herbal ubtan for deep cleansing and natural glow.',
      },
      {
        id: 'skin-ointments',
        name: 'Skincare Ointments',
        slug: 'Skincare Ointments',
        mainCategoryId: 'skin-face-care',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        description: 'Deeply moisturizing botanical ointments to soothe, repair & restore skin health.',
      },
    ],
  },
  {
    id: 'hair-care',
    name: 'Hair Care',
    slug: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    description: 'Pure herbal oils & hair packs formulated for root nourishment & scalp health.',
    subCategories: [
      {
        id: 'hair-oils',
        name: 'Ayurvedic Hair Oils',
        slug: 'Ayurvedic Hair Oils',
        mainCategoryId: 'hair-care',
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800',
        description: 'Cold-pressed Bhringraj, Amla & Brahmi oils for stronger roots and lustrous hair.',
      },
    ],
  },
  {
    id: 'muscle-joint-care',
    name: 'Muscle & Joint Care',
    slug: 'Muscle & Joint Care',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    description: 'Relieve deep tissue tension, joint stress, and muscle soreness naturally.',
    subCategories: [
      {
        id: 'pain-oils',
        name: 'Pain Relief Oils',
        slug: 'Pain Relief Oils',
        mainCategoryId: 'muscle-joint-care',
        image: 'https://images.unsplash.com/photo-1517467139701-4d73ca9e0e8f?auto=format&fit=crop&q=80&w=800',
        description: 'Mahanarayan & Nilgiri-infused oils for targeted joint and muscle pain relief.',
      },
    ],
  },
  {
    id: 'weight-loss',
    name: 'Weight Loss & Metabolic',
    slug: 'Weight Loss & Metabolic',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    description: 'Ayurvedic herbal churna and metabolic wellness powders.',
    subCategories: [
      {
        id: 'churna-powders',
        name: 'Herbal Churna & Powders',
        slug: 'Herbal Churna & Powders',
        mainCategoryId: 'weight-loss',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
        description: 'Triphala, Trikatu & metabolic churnas for digestive health and natural weight management.',
      },
    ],
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'muscle-care',
    name: 'Muscle Care',
    slug: 'Muscle Care',
    href: '/shop/muscle-joint-care',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    description: 'Relieve deep tissue tension, joint stress, and muscle soreness naturally.',
    itemCount: 8,
  },
  {
    id: 'hair-care',
    name: 'Hair Care',
    slug: 'Hair Care',
    href: '/shop/hair-care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    description: 'Pure herbal oils & hair packs formulated for root nourishment & scalp health.',
    itemCount: 12,
  },
  {
    id: 'skin-care',
    name: 'Skin Care',
    slug: 'Skin Care',
    href: '/shop/skin-face-care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    description: 'Botanical face packs, natural ointments & skin restoring elixirs.',
    itemCount: 15,
  },
  {
    id: 'weight-loss',
    name: 'Weight Loss',
    slug: 'Weight Loss',
    href: '/shop/weight-loss',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    description: 'Ayurvedic herbal churna and metabolic wellness formulations.',
    itemCount: 6,
  },
  {
    id: 'joint-care',
    name: 'Joint Care',
    slug: 'Joint Care',
    href: '/shop/muscle-joint-care',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    description: 'Fast-absorbing natural balms & oils for knee, back, and joint mobility.',
    itemCount: 9,
  },
  {
    id: 'face-care',
    name: 'Face Care',
    slug: 'Face Care',
    href: '/shop/skin-face-care/face-packs',
    image: 'https://images.unsplash.com/photo-1512290900676-26c2a46486b6?auto=format&fit=crop&q=80&w=800',
    description: 'Radiance-enhancing herbal ubtans & natural facial treatments.',
    itemCount: 10,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'beautiction-face-pack',
    name: 'Beautiction Face Pack (Regular Pack)',
    category: 'Face Care',
    categoryId: 'face-care',
    mainCategory: 'Skin & Face Care',
    subCategory: 'Face Packs & Ubtan',
    price: 349,
    originalPrice: 499,
    rating: 4.9,
    reviewsCount: 128,
    image: 'https://labdhiherbs.com/uploads/home_banner_images/60-5450.jpg',
    images: [
      'https://labdhiherbs.com/uploads/home_banner_images/60-5450.jpg',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000',
    ],
    videoUrl: '/videos/Create_a_premium_cinematic_bra.mp4',
    tag: 'Bestseller',
    description: 'An authentic Ayurvedic herbal face pack crafted with multani mitti, wild turmeric, sandalwood, and rose extracts to deep clean pores, reduce blemishes, and reveal natural radiant glow.',
    benefits: [
      'Removes excess oil and unclogs deep pores',
      'Reduces dark spots & acne blemishes',
      'Provides natural cooling and soothing effect',
      '100% Free from synthetic chemicals and artificial scent'
    ],
    ingredients: ['Wild Turmeric (Kasturi Manjal)', 'Sandalwood Powder', 'Multani Mitti', 'Rose Petal Extracts', 'Neem Leaf Powder'],
    usage: 'Mix 1-2 tbsp with rose water or milk to form a paste. Apply evenly on face and neck. Wash off after 15 minutes.',
    howToUseVideoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'
  },
  {
    id: 'soft-n-silky-skincare-ointment',
    name: 'Soft N Silky Skincare Ointment',
    category: 'Skin Care',
    categoryId: 'skin-care',
    mainCategory: 'Skin & Face Care',
    subCategory: 'Skincare Ointments',
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviewsCount: 94,
    image: 'https://labdhiherbs.com/uploads/home_banner_images/66-5095.jpg',
    images: [
      'https://labdhiherbs.com/uploads/home_banner_images/66-5095.jpg',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=1000',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1000',
    ],
    tag: 'Popular',
    description: 'Deeply moisturizing herbal ointment formulated with natural botanical extracts to soothe dry, cracked skin, eczema flare-ups, and skin irritations.',
    benefits: [
      'Intense 24-hour skin hydration and protection barrier',
      'Heals cracked heels and rough elbow patches',
      'Soothes skin redness and allergic itchiness',
      'Non-greasy fast absorbing herbal formula'
    ],
    ingredients: ['Pure Aloe Vera Gel', 'Sesame Oil', 'Yastimadhu (Licorice)', 'Manjistha', 'Coconut Oil'],
    usage: 'Apply a generous layer onto clean dry skin 2-3 times daily or whenever skin feels dry.'
  },
  {
    id: 'ayurvedic-hair-growth-oil',
    name: 'Herbal Kesh Sanjivani Hair Oil',
    category: 'Hair Care',
    categoryId: 'hair-care',
    mainCategory: 'Hair Care',
    subCategory: 'Ayurvedic Hair Oils',
    price: 449,
    originalPrice: 599,
    rating: 5.0,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1608248597266-c8906a236316?auto=format&fit=crop&q=80&w=800',
    tag: 'Trending',
    description: 'Traditional slow-infused herbal hair oil with Bhringraj, Amla, Brahmi, and cold-pressed coconut oil to combat hair fall and promote thick, lustrous growth.',
    benefits: [
      'Strengthens hair roots from deep within',
      'Prevents premature greying & scalp dryness',
      'Controls stubborn dandruff and flakiness',
      'Stimulates dormant hair follicles'
    ],
    ingredients: ['Bhringraj (Eclipta Alba)', 'Amla (Indian Gooseberry)', 'Brahmi', 'Curry Leaves', 'Cold Pressed Sesame Oil'],
    usage: 'Massage gently into scalp using fingertips twice a week. Leave overnight or for at least 2 hours before washing.'
  },
  {
    id: 'ortho-pain-relief-oil',
    name: 'Ortho-Relax Joint & Muscle Oil',
    category: 'Muscle Care',
    categoryId: 'muscle-care',
    mainCategory: 'Muscle & Joint Care',
    subCategory: 'Pain Relief Oils',
    price: 399,
    originalPrice: 520,
    rating: 4.9,
    reviewsCount: 86,
    image: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800',
    tag: 'Fast Relief',
    description: 'Powerful herbal pain relief oil infused with Mahanarayan oil, Nilgiri, camphor, and Gandhapura to quickly ease joint stiffness, knee pain, and muscle cramps.',
    benefits: [
      'Rapid penetration for fast pain relief',
      'Improves joint flexibility & mobility',
      'Relieves morning stiffness & back pain',
      '100% Natural Ayurvedic formulation'
    ],
    ingredients: ['Mahanarayan Taila', 'Gandhapura Oil (Wintergreen)', 'Eucalyptus Oil', 'Camphor (Karpura)', 'Sesame Oil'],
    usage: 'Apply 5-10 drops on affected area and gently massage until absorbed. Warm compress can be applied after massage.'
  },
  {
    id: 'herbal-weight-balance-churna',
    name: 'Herbal Weight Balance Churna',
    category: 'Weight Loss',
    categoryId: 'weight-loss',
    mainCategory: 'Weight Loss & Metabolic',
    subCategory: 'Herbal Churna & Powders',
    price: 499,
    originalPrice: 650,
    rating: 4.7,
    reviewsCount: 65,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    tag: 'Ayurvedic Powder',
    description: 'Synergistic herbal digestive and metabolic blend formulated with Triphala, Guggulu, and Vrikshamla to support natural weight management and gut health.',
    benefits: [
      'Boosts natural digestive metabolism',
      'Helps detoxify gut & colon',
      'Supports healthy fat metabolism',
      'Improves overall energy & lightness'
    ],
    ingredients: ['Triphala (Haritaki, Bibhitaki, Amla)', 'Shuddha Guggulu', 'Vrikshamla (Garcinia)', 'Jeera', 'Methi Seed'],
    usage: 'Take 1 teaspoon with lukewarm water twice daily after meals.'
  },
  {
    id: 'herbal-glow-ubtan-pack',
    name: 'Natural Herbal Glow Ubtan',
    category: 'Face Care',
    categoryId: 'face-care',
    mainCategory: 'Skin & Face Care',
    subCategory: 'Face Packs & Ubtan',
    price: 379,
    originalPrice: 480,
    rating: 4.9,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=800',
    tag: 'Bridal Choice',
    description: 'Traditional Indian wedding ubtan prepared with gram flour, turmeric, saffron threads, and powdered herbs for silky smooth skin texture and natural glow.',
    benefits: [
      'Gently exfoliates dead skin cells',
      'Brightens dull & tanned skin tones',
      'Leaves skin silky soft & scented',
      'Free from chemical preservatives'
    ],
    ingredients: ['Besan (Gram Flour)', 'Kesar (Saffron)', 'Kasturi Turmeric', 'Almond Powder', 'Orange Peel Powder'],
    usage: 'Mix with raw milk, curd, or rose water. Apply over face and body. Scrub off gently when semi-dry.'
  }
];

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

export function getProductByIdOrSlug(idOrSlug: string): Product {
  if (!idOrSlug) return PRODUCTS[0];
  
  // 1. Match by id string (e.g. 'beautiction-face-pack')
  const match = PRODUCTS.find((p) => p.id.toLowerCase() === idOrSlug.toLowerCase());
  if (match) return match;

  // 2. Match by 1-based numeric index (e.g. '1' -> PRODUCTS[0], '2' -> PRODUCTS[1])
  const idx = parseInt(idOrSlug, 10);
  if (!isNaN(idx) && idx >= 1 && idx <= PRODUCTS.length) {
    return PRODUCTS[idx - 1];
  }

  return PRODUCTS[0];
}
