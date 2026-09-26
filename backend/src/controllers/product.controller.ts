import { Request, Response } from 'express';
import { Product } from '../models/Product.model.js';

const INITIAL_PRODUCTS = [
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
    tag: 'Bestseller',
    description:
      'An authentic Ayurvedic herbal face pack crafted with multani mitti, wild turmeric, sandalwood, and rose extracts to deep clean pores, reduce blemishes, and reveal natural radiant glow.',
    benefits: [
      'Removes excess oil and unclogs deep pores',
      'Reduces dark spots & acne blemishes',
      'Provides natural cooling and soothing effect',
      '100% Free from synthetic chemicals and artificial scent',
    ],
    ingredients: [
      'Wild Turmeric (Kasturi Manjal)',
      'Sandalwood Powder',
      'Multani Mitti',
      'Rose Petal Extracts',
      'Neem Leaf Powder',
    ],
    usage:
      'Mix 1-2 tbsp with rose water or milk to form a paste. Apply evenly on face and neck. Wash off after 15 minutes.',
    howToUseVideoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    inStock: true,
    featured: true,
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
    tag: 'Popular',
    description:
      'Deeply moisturizing herbal ointment formulated with natural botanical extracts to soothe dry, cracked skin, eczema flare-ups, and skin irritations.',
    benefits: [
      'Intense 24-hour skin hydration and protection barrier',
      'Heals cracked heels and rough elbow patches',
      'Soothes skin redness and allergic itchiness',
      'Non-greasy fast absorbing herbal formula',
    ],
    ingredients: [
      'Pure Aloe Vera Gel',
      'Sesame Oil',
      'Yastimadhu (Licorice)',
      'Manjistha',
      'Coconut Oil',
    ],
    usage:
      'Apply a generous layer onto clean dry skin 2-3 times daily or whenever skin feels dry.',
    inStock: true,
    featured: true,
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
    image:
      'https://images.unsplash.com/photo-1608248597266-c8906a236316?auto=format&fit=crop&q=80&w=800',
    tag: 'Trending',
    description:
      'Traditional slow-infused herbal hair oil with Bhringraj, Amla, Brahmi, and cold-pressed coconut oil to combat hair fall and promote thick, lustrous growth.',
    benefits: [
      'Strengthens hair roots from deep within',
      'Prevents premature greying & scalp dryness',
      'Controls stubborn dandruff and flakiness',
      'Stimulates dormant hair follicles',
    ],
    ingredients: [
      'Bhringraj (Eclipta Alba)',
      'Amla (Indian Gooseberry)',
      'Brahmi',
      'Curry Leaves',
      'Cold Pressed Sesame Oil',
    ],
    usage:
      'Massage gently into scalp using fingertips twice a week. Leave overnight or for at least 2 hours before washing.',
    inStock: true,
    featured: true,
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
    image:
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=800',
    tag: 'Fast Relief',
    description:
      'Powerful herbal pain relief oil infused with Mahanarayan oil, Nilgiri, camphor, and Gandhapura to quickly ease joint stiffness, knee pain, and muscle cramps.',
    benefits: [
      'Rapid penetration for fast pain relief',
      'Improves joint flexibility & mobility',
      'Relieves morning stiffness & back pain',
      '100% Natural Ayurvedic formulation',
    ],
    ingredients: [
      'Mahanarayan Taila',
      'Gandhapura Oil (Wintergreen)',
      'Eucalyptus Oil',
      'Camphor (Karpura)',
      'Sesame Oil',
    ],
    usage:
      'Apply 5-10 drops on affected area and gently massage until absorbed. Warm compress can be applied after massage.',
    inStock: true,
    featured: false,
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
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
    tag: 'Ayurvedic Powder',
    description:
      'Synergistic herbal digestive and metabolic blend formulated with Triphala, Guggulu, and Vrikshamla to support natural weight management and gut health.',
    benefits: [
      'Supports healthy fat metabolism and digestion',
      'Gentle gut detoxifier and bowel cleanser',
      'Balances Kapha and Vata doshas naturally',
      'Free from chemical laxatives and preservatives',
    ],
    ingredients: ['Triphala (Amalaki, Bibhitaki, Haritaki)', 'Shuddha Guggulu', 'Vrikshamla (Garcinia)', 'Ginger (Sunthi)', 'Black Pepper (Maricha)'],
    usage:
      'Take 1 teaspoon (3-5g) with warm water twice daily after meals, or as advised by your Ayurvedic physician.',
    inStock: true,
    featured: false,
  },
  {
    id: 'neem-tulsi-purifying-face-pack',
    name: 'Neem Tulsi Purifying Face Pack',
    category: 'Face Care',
    categoryId: 'face-care',
    mainCategory: 'Skin & Face Care',
    subCategory: 'Face Packs & Ubtan',
    price: 329,
    originalPrice: 450,
    rating: 4.9,
    reviewsCount: 112,
    image:
      'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800',
    tag: 'Anti-Acne',
    description:
      'Antibacterial facial mask with pure organic Neem leaf powder, holy Tulsi, and Fuller’s earth to prevent breakouts and clarify complexion.',
    benefits: [
      'Fights active acne bacteria and prevents pimples',
      'Deeply cleanses congested pores and blackheads',
      'Soothes redness and calms skin irritation',
      'Promotes clean, clear, healthy complexion',
    ],
    ingredients: ['Organic Neem Powder', 'Tulsi (Holy Basil)', 'Fullers Earth', 'Tea Tree Oil Drops', 'Turmeric'],
    usage:
      'Mix 1 spoon with pure rose water or cucumber juice. Apply for 12-15 minutes and rinse thoroughly with cool water.',
    inStock: true,
    featured: true,
  },
];

const ensureInitialProducts = async () => {
  // Auto-seeding disabled so deleted products never re-appear on restart
  return;
};

/**
 * @desc Get all products with filters & pagination
 * @route GET /api/v1/products
 * @access Public
 */
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureInitialProducts();

    const {
      category,
      categoryId,
      mainCategory,
      subCategory,
      search,
      featured,
      inStock,
      minPrice,
      maxPrice,
      sort,
      page = '1',
      limit = '50',
    } = req.query;

    const filter: any = {};

    if (category) {
      filter.$or = [
        { category: { $regex: String(category), $options: 'i' } },
        { categoryId: { $regex: String(category), $options: 'i' } },
        { mainCategory: { $regex: String(category), $options: 'i' } },
      ];
    }

    if (categoryId) {
      filter.categoryId = String(categoryId);
    }

    if (mainCategory) {
      filter.mainCategory = { $regex: String(mainCategory), $options: 'i' };
    }

    if (subCategory) {
      filter.subCategory = { $regex: String(subCategory), $options: 'i' };
    }

    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      const searchRegex = { $regex: String(search), $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { mainCategory: searchRegex },
        { subCategory: searchRegex },
        { ingredients: searchRegex },
        { benefits: searchRegex },
      ];
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1, reviewsCount: -1 };
    else if (sort === 'popular') sortOption = { reviewsCount: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.max(1, parseInt(String(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts: totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

/**
 * @desc Get single product by id or slug
 * @route GET /api/v1/products/:id
 * @access Public
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureInitialProducts();
    const { id } = req.params;

    const product = await Product.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    }).lean();

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message,
    });
  }
};

/**
 * @desc Create new Product
 * @route POST /api/v1/products
 * @access Private (Admin only)
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id,
      name,
      category,
      categoryId,
      mainCategory,
      subCategory,
      price,
      originalPrice,
      rating,
      reviewsCount,
      image,
      hoverImage,
      images,
      tag,
      description,
      benefits,
      ingredients,
      usage,
      inStock,
      featured,
      videoUrl,
      howToUseVideoUrl,
    } = req.body;

    if (!name || price === undefined || !image) {
      res.status(400).json({
        success: false,
        message: 'Name, price, and image are required',
      });
      return;
    }

    const productId =
      id ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const existing = await Product.findOne({ id: productId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Product with slug "${productId}" already exists`,
      });
      return;
    }

    const newProduct = await Product.create({
      id: productId,
      name,
      category: category || 'Herbal Care',
      categoryId: categoryId || 'herbal-care',
      mainCategory: mainCategory || 'Skin & Face Care',
      subCategory: subCategory || 'Herbal Formulations',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      rating: rating ? Number(rating) : 5.0,
      reviewsCount: reviewsCount ? Number(reviewsCount) : 0,
      image,
      hoverImage: hoverImage || '',
      images: images || [image],
      videoUrl: videoUrl || '',
      howToUseVideoUrl: howToUseVideoUrl || '',
      tag: tag || '',
      description: description || '',
      benefits: Array.isArray(benefits) ? benefits : [],
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      usage: usage || '',
      inStock: inStock !== undefined ? inStock : true,
      featured: featured !== undefined ? featured : false,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message,
    });
  }
};

/**
 * @desc Update Product
 * @route PUT /api/v1/products/:id
 * @access Private (Admin only)
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      if (key !== '_id') {
        (product as any)[key] = updates[key];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message,
    });
  }
};

/**
 * @desc Delete Product
 * @route DELETE /api/v1/products/:id
 * @access Private (Admin only)
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message,
    });
  }
};

/**
 * @desc Toggle Product Featured Status (Show on Home Page)
 * @route PATCH /api/v1/products/:id/featured
 * @access Private (Admin only)
 */
export const toggleProductFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    product.featured = !product.featured;
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${product.featured ? 'is now shown in' : 'is now hidden from'} the Homepage Showcase section`,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle product home showcase status',
      error: error.message,
    });
  }
};

