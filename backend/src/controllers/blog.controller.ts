import { Request, Response } from 'express';
import Blog, { IBlog } from '../models/Blog.model.js';

const INITIAL_BLOGS = [
  {
    id: 'ancient-secrets-herbal-face-packs',
    title: 'The Ancient Secrets of Herbal Face Packs for Glowing Skin',
    slug: 'ancient-secrets-herbal-face-packs',
    excerpt:
      'Discover how centuries-old Ayurvedic botanicals like Wild Turmeric and Sandalwood restore natural skin balance without harsh chemicals.',
    content: `Ayurveda has revered botanical face packs (Mukha Lepa) for over 5,000 years. Unlike synthetic chemical peels that strip the epidermal acid mantle, pure Ayurvedic formulations work in synergy with your skin's natural renewal cycle.

### The Sacred Triad: Kasturi Turmeric, Sandalwood & Besan

Wild Turmeric (Kasturi Manjal) delivers potent curcuminoids that inhibit melanin hyper-clustering, gradually erasing stubborn blemish marks and sun-induced pigmentation.

White Sandalwood (Chandan) provides instantaneous cooling relief, soothing pitta-aggravated redness, inflammation, and hormonal acne flare-ups.

Fine Gram Flour (Besan) serves as a micro-exfoliant, naturally pulling out trapped sebum and environmental particulate matter without micro-tearing delicate skin tissue.

### How to Create Your Weekly Glow Ritual

1. Cleanse face with lukewarm water.
2. Mix 1-2 tablespoons of Beautiction Face Pack with pure rose water (for oily/combination skin) or raw milk/curd (for dry skin).
3. Apply evenly and leave for 12-15 minutes until semi-dry.
4. Gently massage in circular upward motions with damp fingers to stimulate microcirculation, then rinse thoroughly.`,
    category: 'Skin Care',
    author: 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    date: 'August 24, 2026',
    featured: true,
    status: 'published',
    order: 1,
    tags: ['Skin Care', 'Ayurveda', 'Face Pack', 'Glow'],
    views: 124,
  },
  {
    id: 'combating-hair-fall-naturally',
    title: 'Root Nourishment: How Bhringraj & Amla Stop Hair Fall',
    slug: 'combating-hair-fall-naturally',
    excerpt:
      'Understanding the science behind cold-pressed herbal oil infusion and why deep scalp massage accelerates dormant follicle activation.',
    content: `Hair thinning and sudden seasonal shedding are predominantly caused by excess Pitta heat in the scalp and micro-inflammation around the follicle bulb.

### The Science of Kshir Pak Oil Preparation

Labdhi Herbs uses traditional Kshir Pak and Taila Paka Vidhi — slow simmering potent herbs in pure cold-pressed sesame and coconut oil over slow fire for 72 hours until the medicinal essence is completely absorbed.

- **Bhringraj (Eclipta Alba)**: Known as 'Keshraj' (King of Hair), it stimulates follicular blood circulation and arrests the catagen (shedding) phase.
- **Amla (Indian Gooseberry)**: Extremely rich in Vitamin C and tannins, strengthens keratin structure and prevents premature silvering.
- **Brahmi & Jatamansi**: Calm the central nervous system, relieving stress-induced telogen effluvium.

### Recommended Application Routine

Apply warm oil 2-3 nights per week. Part hair into sections and massage gently using the pads of your fingertips in small circular movements for 10 minutes. Leave overnight and wash with a gentle herbal cleanser.`,
    category: 'Hair Care',
    author: 'Labdhi Herbs Wellness Team',
    image:
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
    readTime: '6 min read',
    date: 'August 18, 2026',
    featured: false,
    status: 'published',
    order: 2,
    tags: ['Hair Care', 'Bhringraj', 'Hair Fall', 'Herbal Oil'],
    views: 98,
  },
  {
    id: 'joint-mobility-and-herbal-balms',
    title: '5 Daily Ayurvedic Rituals for Healthy Joints & Muscle Mobility',
    slug: 'joint-mobility-and-herbal-balms',
    excerpt:
      'Simple daily warm-oil self-massage techniques to relieve joint stiffness and keep muscles flexible as seasons change.',
    content: `In Ayurvedic physiology, joint discomfort and stiffness are expressions of aggregated Vata dosha accumulating in the Sandhi (joints) and drying out synovial fluid.

### 5 Essential Daily Habits for Joint Longevity

1. **Morning Abhyanga**: Warm 2 tablespoons of Ortho-Relax Oil between your palms and massage over knees, elbows, and shoulders with circular motions.
2. **Gentle Sukshma Vyayama**: Micro-rotations of wrists, ankles, and neck before getting out of bed.
3. **Hydration with Warm Infusions**: Drink warm ginger and fenugreek water to flush out metabolic toxins (Ama).
4. **Sun Exposure (Surya Namaskar)**: 15 minutes of early morning sun exposure helps activate natural bone density pathways.
5. **Night Warm Compress**: In colder weather, follow an herbal massage with a warm cloth compress to deepen botanical absorption.`,
    category: 'Muscle & Joint Care',
    author: 'Labdhi Herbs Research',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800',
    readTime: '5 min read',
    date: 'August 10, 2026',
    featured: false,
    showOnHome: true,
    status: 'published',
    order: 3,
    tags: ['Joint Care', 'Mobility', 'Ayurveda', 'Pain Relief'],
    views: 85,
  },
  {
    id: 'ayurvedic-dinacharya-daily-wellness',
    title: 'Ayurvedic Dinacharya: 4 Simple Morning Habits for Daily Vitality',
    slug: 'ayurvedic-dinacharya-daily-wellness',
    excerpt:
      'How waking with the sun, tongue scraping, warm herbal water, and botanical nourishment balance Agni and boost all-day focus.',
    content: `In classical Charaka Samhita, Dinacharya (the daily routine) represents the most potent preventive healthcare system in Ayurvedic science. Synchronizing your biological circadian rhythm with the natural solar cycle grounds the nervous system and stokes your digestive fire (Jatharagni).

### 1. Brahma Muhurta & Early Rising

Waking approximately 45 minutes before sunrise harnesses the pre-dawn Sattvic energy. This minimizes heavy Kapha accumulation that manifests as morning grogginess and lethargy.

### 2. Jivha Nirlekhana (Tongue Scraping)

During deep sleep, the digestive tract expels metabolic toxins (Ama) that coat the tongue. Using a pure copper tongue scraper removes this toxic residue, freshens breath, and awakens oral enzymes.

### 3. Ushapan (Warm Water Hydration)

Drinking 1-2 glasses of lukewarm water infused with ginger, cumin, or a slice of fresh lemon immediately stimulates the peristaltic bowel reflex, ensuring effortless morning elimination.

### 4. Nasya & Botanical Scalp Nourishment

Instilling two drops of warm sesame oil into each nostril lubricates cranial pathways, improves oxygen flow, and protects mucous membranes from airborne allergens.`,
    category: 'Wellness',
    author: 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    readTime: '4 min read',
    date: 'August 05, 2026',
    featured: false,
    showOnHome: true,
    status: 'published',
    order: 4,
    tags: ['Dinacharya', 'Wellness', 'Ayurveda', 'Morning Routine'],
    views: 110,
  },
];

const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateReadTime = (content: string, excerpt: string): string => {
  const text = `${excerpt} ${content}`;
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} min read`;
};

let isBlogsSeeded = false;

/**
 * Seed initial blogs if collection is empty, and ensure all initial 4 blogs exist
 */
const ensureSeedBlogs = async () => {
  if (isBlogsSeeded) return;
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      await Blog.insertMany(INITIAL_BLOGS);
      isBlogsSeeded = true;
      return;
    }

    // Ensure 4th article exists if older DB had only 3
    const hasFourth = await Blog.findOne({ id: 'ayurvedic-dinacharya-daily-wellness' });
    if (!hasFourth) {
      const fourth = INITIAL_BLOGS.find((b) => b.id === 'ayurvedic-dinacharya-daily-wellness');
      if (fourth) {
        await Blog.create(fourth);
      }
    }

    // Ensure showOnHome is populated for existing docs
    await Blog.updateMany({ showOnHome: { $exists: false } }, { $set: { showOnHome: true } });
    isBlogsSeeded = true;
  } catch (err) {
    // If DB is temporarily busy, retry on next call
  }
};

/**
 * @desc Get all published blog articles for storefront
 * @route GET /api/v1/blogs or /api/public/blogs
 * @access Public
 */
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureSeedBlogs();

    const { category, search, showOnHome } = req.query;
    const filter: any = { status: 'published' };

    if (showOnHome !== undefined) {
      filter.showOnHome = showOnHome === 'true';
    }

    if (category && category !== 'All') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const blogs = await Blog.find(filter)
      .sort({
        featured: -1,
        order: 1,
        createdAt: -1,
      })
      .lean();

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message,
    });
  }
};

/**
 * @desc Get single blog article by id or slug
 * @route GET /api/v1/blogs/:id
 * @access Public
 */
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureSeedBlogs();
    const { id } = req.params;

    const blog = await Blog.findOne({
      $or: [{ id }, { slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
      return;
    }

    // Increment views counter
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog article',
      error: error.message,
    });
  }
};

/**
 * @desc Get all blogs for Admin Dashboard (includes drafts & stats)
 * @route GET /api/v1/blogs/admin/all
 * @access Private (Admin)
 */
export const getAdminBlogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureSeedBlogs();

    const blogs = await Blog.find().sort({ order: 1, createdAt: -1 });

    const categoriesSet = new Set(blogs.map((b) => b.category).filter(Boolean));

    const stats = {
      totalBlogs: blogs.length,
      publishedBlogs: blogs.filter((b) => b.status === 'published').length,
      draftBlogs: blogs.filter((b) => b.status === 'draft').length,
      featuredBlogs: blogs.filter((b) => b.featured).length,
      homeBlogs: blogs.filter((b) => (b as any).showOnHome).length,
      categoriesCount: categoriesSet.size,
    };

    res.status(200).json({
      success: true,
      stats,
      data: blogs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin blogs',
      error: error.message,
    });
  }
};

/**
 * @desc Create a new blog post
 * @route POST /api/v1/blogs
 * @access Private (Admin)
 */
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      author,
      image,
      readTime,
      date,
      featured,
      showOnHome,
      status,
      order,
      tags,
    } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: 'Article title is required' });
      return;
    }
    if (!excerpt || !excerpt.trim()) {
      res.status(400).json({ success: false, message: 'Short excerpt is required' });
      return;
    }
    if (!image || !image.trim()) {
      res.status(400).json({ success: false, message: 'Cover image is required' });
      return;
    }

    const baseSlug =
      (slug && slug.trim().length > 0 ? generateSlug(slug) : generateSlug(title)) ||
      `article-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ id: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const count = await Blog.countDocuments();
    const finalReadTime =
      readTime && readTime.trim().length > 0
        ? readTime.trim()
        : calculateReadTime(content || '', excerpt);

    const formattedDate =
      date && date.trim().length > 0
        ? date.trim()
        : new Date().toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          });

    const newBlog = await Blog.create({
      id: uniqueSlug,
      slug: uniqueSlug,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content ? content.trim() : '',
      category: category ? category.trim() : 'Wellness',
      author: author ? author.trim() : 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
      image: image.trim(),
      readTime: finalReadTime,
      date: formattedDate,
      featured: Boolean(featured),
      showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : true,
      status: status === 'draft' ? 'draft' : 'published',
      order: order !== undefined ? Number(order) : count + 1,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      views: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Blog article created successfully',
      data: newBlog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create blog article',
      error: error.message,
    });
  }
};

/**
 * @desc Update a blog post
 * @route PUT /api/v1/blogs/:id
 * @access Private (Admin)
 */
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
      return;
    }

    const updates = req.body;
    delete updates._id;
    delete updates.id; // Keep immutable id

    if (updates.content && !updates.readTime) {
      updates.readTime = calculateReadTime(updates.content, updates.excerpt || blog.excerpt);
    }

    Object.keys(updates).forEach((key) => {
      (blog as any)[key] = updates[key];
    });

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Blog article updated successfully',
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update blog article',
      error: error.message,
    });
  }
};

/**
 * @desc Toggle blog status (published / draft)
 * @route PATCH /api/v1/blogs/:id/status
 * @access Private (Admin)
 */
export const toggleBlogStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
      return;
    }

    blog.status = blog.status === 'published' ? 'draft' : 'published';
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog status updated to ${blog.status}`,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle blog status',
      error: error.message,
    });
  }
};

/**
 * @desc Toggle blog showOnHome status (Show on Homepage section)
 * @route PATCH /api/v1/blogs/:id/home
 * @access Private (Admin)
 */
export const toggleBlogHomeStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOne({
      $or: [{ id }, { slug: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
      return;
    }

    blog.showOnHome = !blog.showOnHome;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Article ${blog.showOnHome ? 'is now shown in' : 'is now hidden from'} the Homepage section`,
      data: blog,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle blog homepage status',
      error: error.message,
    });
  }
};

/**
 * @desc Delete a blog post
 * @route DELETE /api/v1/blogs/:id
 * @access Private (Admin)
 */
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const blog = await Blog.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: 'Blog article not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Blog article deleted successfully',
      data: { id: blog.id },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog article',
      error: error.message,
    });
  }
};
