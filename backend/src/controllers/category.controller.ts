import { Request, Response } from 'express';
import { Category, ICategory } from '../models/Category.model.js';

// Default initial categories seed
const INITIAL_CATEGORIES = [
  {
    id: 'skin-face-care',
    name: 'Skin & Face Care',
    slug: 'Skin & Face Care',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    description: 'Botanical face packs, natural ointments & skin restoring elixirs.',
    status: 'active',
    order: 1,
    subCategories: [
      {
        id: 'face-packs',
        name: 'Face Packs & Ubtan',
        slug: 'Face Packs & Ubtan',
        mainCategoryId: 'skin-face-care',
        image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&q=80&w=800',
        description: 'Traditional multani mitti & herbal ubtan for deep cleansing and natural glow.',
        itemCount: 2,
      },
      {
        id: 'skin-ointments',
        name: 'Skincare Ointments',
        slug: 'Skincare Ointments',
        mainCategoryId: 'skin-face-care',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
        description: 'Deeply moisturizing botanical ointments to soothe, repair & restore skin health.',
        itemCount: 1,
      },
    ],
  },
  {
    id: 'hair-care',
    name: 'Hair Care',
    slug: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    description: 'Pure herbal oils & hair packs formulated for root nourishment & scalp health.',
    status: 'active',
    order: 2,
    subCategories: [
      {
        id: 'hair-oils',
        name: 'Ayurvedic Hair Oils',
        slug: 'Ayurvedic Hair Oils',
        mainCategoryId: 'hair-care',
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800',
        description: 'Cold-pressed Bhringraj, Amla & Brahmi oils for stronger roots and lustrous hair.',
        itemCount: 1,
      },
    ],
  },
  {
    id: 'muscle-joint-care',
    name: 'Muscle & Joint Care',
    slug: 'Muscle & Joint Care',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
    description: 'Relieve deep tissue tension, joint stress, and muscle soreness naturally.',
    status: 'active',
    order: 3,
    subCategories: [
      {
        id: 'pain-oils',
        name: 'Pain Relief Oils',
        slug: 'Pain Relief Oils',
        mainCategoryId: 'muscle-joint-care',
        image: 'https://images.unsplash.com/photo-1517467139701-4d73ca9e0e8f?auto=format&fit=crop&q=80&w=800',
        description: 'Mahanarayan & Nilgiri-infused oils for targeted joint and muscle pain relief.',
        itemCount: 1,
      },
    ],
  },
  {
    id: 'weight-loss',
    name: 'Weight Loss & Metabolic',
    slug: 'Weight Loss & Metabolic',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800',
    description: 'Ayurvedic herbal churna and metabolic wellness powders.',
    status: 'active',
    order: 4,
    subCategories: [
      {
        id: 'churna-powders',
        name: 'Herbal Churna & Powders',
        slug: 'Herbal Churna & Powders',
        mainCategoryId: 'weight-loss',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
        description: 'Traditional Triphala and digestive powders supporting natural fat metabolism.',
        itemCount: 1,
      },
    ],
  },
];

/**
 * Auto-seed categories if collection is empty, and ensure default sub-categories are populated
 */
const ensureInitialCategories = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(INITIAL_CATEGORIES);
    return;
  }

  // Fix any existing category in database that lacks an 'id'
  const allExisting = await Category.find();
  for (const cat of allExisting) {
    let modified = false;
    if (!cat.id) {
      cat.id = generateSlug(cat.slug || cat.name || String(cat._id));
      modified = true;
    }
    if (modified) {
      await cat.save();
    }
  }

  // Ensure initial categories have their sub-categories populated if empty
  for (const initCat of INITIAL_CATEGORIES) {
    const existing = await Category.findOne({
      $or: [{ id: initCat.id }, { slug: initCat.slug }, { name: initCat.name }],
    });
    if (existing) {
      let modified = false;
      if (!existing.id) {
        existing.id = initCat.id;
        modified = true;
      }
      if (!existing.subCategories || existing.subCategories.length === 0) {
        existing.subCategories = initCat.subCategories as any;
        modified = true;
      }
      if (modified) {
        await existing.save();
      }
    } else {
      await Category.create(initCat);
    }
  }
};

/**
 * Helper to generate a URL-friendly slug
 */
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * @desc Get all active categories (Public shop page)
 * @route GET /api/v1/categories
 * @access Public
 */
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureInitialCategories();
    const categories = await Category.find({ status: 'active' }).sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

/**
 * @desc Get all categories with stats (Admin dashboard)
 * @route GET /api/v1/categories/admin
 * @access Private (Admin only)
 */
export const getAdminCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureInitialCategories();

    const search = req.query.search ? String(req.query.search).trim() : '';
    const status = req.query.status ? String(req.query.status).trim() : 'all';

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
      ];
    }

    const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 });

    // Calculate summary statistics
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ status: 'active' });
    const inactiveCategories = await Category.countDocuments({ status: 'inactive' });

    const allCats = await Category.find();
    let totalSubCategories = 0;
    allCats.forEach((c) => {
      totalSubCategories += c.subCategories?.length || 0;
    });

    res.status(200).json({
      success: true,
      data: categories,
      stats: {
        totalCategories,
        activeCategories,
        inactiveCategories,
        totalSubCategories,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin categories',
      error: error.message,
    });
  }
};

/**
 * @desc Get single category by ID or slug
 * @route GET /api/v1/categories/:id
 * @access Public
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
};

/**
 * @desc Create new Category
 * @route POST /api/v1/categories
 * @access Private (Admin only)
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, image, order, subCategories, status } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
      return;
    }

    const categoryId = slug ? generateSlug(slug) : generateSlug(name);

    const existing = await Category.findOne({ id: categoryId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: `Category with identifier "${categoryId}" already exists`,
      });
      return;
    }

    // Process sub-categories if provided
    const formattedSubCategories = (subCategories || []).map((sc: any) => ({
      id: sc.id ? generateSlug(sc.id) : generateSlug(sc.name),
      name: sc.name,
      slug: sc.slug || sc.name,
      mainCategoryId: categoryId,
      image: sc.image || '',
      description: sc.description || '',
      itemCount: sc.itemCount || 0,
    }));

    const newCategory = await Category.create({
      id: categoryId,
      name,
      slug: slug || name,
      description: description || '',
      image:
        image ||
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      status: status || 'active',
      order: order || 0,
      subCategories: formattedSubCategories,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
};

/**
 * @desc Update Category
 * @route PUT /api/v1/categories/:id
 * @access Private (Admin only)
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image, order, subCategories, status } = req.body;

    const category = await Category.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (order !== undefined) category.order = order;
    if (status !== undefined) category.status = status;

    if (Array.isArray(subCategories)) {
      category.subCategories = subCategories.map((sc: any) => ({
        id: sc.id ? generateSlug(sc.id) : generateSlug(sc.name),
        name: sc.name,
        slug: sc.slug || sc.name,
        mainCategoryId: category.id,
        image: sc.image || '',
        description: sc.description || '',
        itemCount: sc.itemCount || 0,
      }));
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
};

/**
 * @desc Toggle Category status (Active / Inactive)
 * @route PATCH /api/v1/categories/:id/status
 * @access Private (Admin only)
 */
export const toggleCategoryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    category.status = category.status === 'active' ? 'inactive' : 'active';
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category marked as ${category.status}`,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      error: error.message,
    });
  }
};

/**
 * @desc Delete Category
 * @route DELETE /api/v1/categories/:id
 * @access Private (Admin only)
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
};

/**
 * @desc Get all sub-categories across all main categories (for Sub-Categories Tab)
 * @route GET /api/v1/categories/subcategories/all
 * @access Public / Admin
 */
export const getAllSubCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    await ensureInitialCategories();
    const categories = await Category.find();

    const subCategoriesList: any[] = [];
    categories.forEach((cat) => {
      if (cat.subCategories && Array.isArray(cat.subCategories)) {
        cat.subCategories.forEach((sc) => {
          const scObj = (sc as any).toObject ? (sc as any).toObject() : sc;
          subCategoriesList.push({
            ...scObj,
            parentCategoryId: cat.id,
            parentCategoryName: cat.name,
            parentCategoryStatus: cat.status,
          });
        });
      }
    });

    res.status(200).json({
      success: true,
      data: subCategoriesList,
      totalCount: subCategoriesList.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sub-categories',
      error: error.message,
    });
  }
};

/**
 * @desc Create new Sub-Category under a Main Category
 * @route POST /api/v1/categories/:mainCategoryId/subcategories
 * @access Private (Admin only)
 */
export const createSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mainCategoryId } = req.params;
    const { name, slug, image, description, itemCount } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Sub-category name is required',
      });
      return;
    }

    const category = await Category.findOne({
      $or: [{ id: mainCategoryId }, { _id: mainCategoryId.match(/^[0-9a-fA-F]{24}$/) ? mainCategoryId : null }],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: `Main category "${mainCategoryId}" not found`,
      });
      return;
    }

    const subId = slug ? generateSlug(slug) : generateSlug(name);

    // Check duplicate in this category
    const exists = category.subCategories.some((sc) => sc.id === subId);
    if (exists) {
      res.status(400).json({
        success: false,
        message: `Sub-category with ID "${subId}" already exists in ${category.name}`,
      });
      return;
    }

    const newSubCategory = {
      id: subId,
      name,
      slug: slug || name,
      mainCategoryId: category.id,
      image: image || '',
      description: description || '',
      itemCount: Number(itemCount) || 0,
    };

    category.subCategories.push(newSubCategory as any);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Sub-category created successfully',
      data: newSubCategory,
      parentCategory: { id: category.id, name: category.name },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create sub-category',
      error: error.message,
    });
  }
};

/**
 * @desc Update Sub-Category
 * @route PUT /api/v1/categories/:mainCategoryId/subcategories/:subCategoryId
 * @access Private (Admin only)
 */
export const updateSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mainCategoryId, subCategoryId } = req.params;
    const { name, slug, image, description, itemCount, newParentCategoryId } = req.body;

    const sourceCategory = await Category.findOne({
      $or: [{ id: mainCategoryId }, { _id: mainCategoryId.match(/^[0-9a-fA-F]{24}$/) ? mainCategoryId : null }],
    });

    if (!sourceCategory) {
      res.status(404).json({
        success: false,
        message: `Main category "${mainCategoryId}" not found`,
      });
      return;
    }

    const subIndex = sourceCategory.subCategories.findIndex(
      (sc) => sc.id === subCategoryId
    );

    if (subIndex === -1) {
      res.status(404).json({
        success: false,
        message: `Sub-category "${subCategoryId}" not found in ${sourceCategory.name}`,
      });
      return;
    }

    // Check if moving to a different parent main category
    if (newParentCategoryId && newParentCategoryId !== sourceCategory.id) {
      const targetCategory = await Category.findOne({
        $or: [{ id: newParentCategoryId }, { _id: newParentCategoryId.match(/^[0-9a-fA-F]{24}$/) ? newParentCategoryId : null }],
      });

      if (!targetCategory) {
        res.status(404).json({
          success: false,
          message: `Target main category "${newParentCategoryId}" not found`,
        });
        return;
      }

      const [removedSub] = sourceCategory.subCategories.splice(subIndex, 1);
      await sourceCategory.save();

      const updatedSub = {
        id: slug ? generateSlug(slug) : removedSub.id,
        name: name || removedSub.name,
        slug: slug || removedSub.slug,
        mainCategoryId: targetCategory.id,
        image: image !== undefined ? image : removedSub.image,
        description: description !== undefined ? description : removedSub.description,
        itemCount: itemCount !== undefined ? Number(itemCount) : removedSub.itemCount,
      };

      targetCategory.subCategories.push(updatedSub as any);
      await targetCategory.save();

      res.status(200).json({
        success: true,
        message: `Sub-category moved and updated to ${targetCategory.name}`,
        data: updatedSub,
      });
      return;
    }

    // Updating within same parent
    const currentSub = sourceCategory.subCategories[subIndex];
    if (name) currentSub.name = name;
    if (slug) currentSub.slug = slug;
    if (image !== undefined) currentSub.image = image;
    if (description !== undefined) currentSub.description = description;
    if (itemCount !== undefined) currentSub.itemCount = Number(itemCount);

    await sourceCategory.save();

    res.status(200).json({
      success: true,
      message: 'Sub-category updated successfully',
      data: currentSub,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update sub-category',
      error: error.message,
    });
  }
};

/**
 * @desc Delete Sub-Category from a Main Category
 * @route DELETE /api/v1/categories/:mainCategoryId/subcategories/:subCategoryId
 * @access Private (Admin only)
 */
export const deleteSubCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mainCategoryId, subCategoryId } = req.params;

    const category = await Category.findOne({
      $or: [{ id: mainCategoryId }, { _id: mainCategoryId.match(/^[0-9a-fA-F]{24}$/) ? mainCategoryId : null }],
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: `Main category "${mainCategoryId}" not found`,
      });
      return;
    }

    const initialLength = category.subCategories.length;
    category.subCategories = category.subCategories.filter(
      (sc) => sc.id !== subCategoryId
    );

    if (category.subCategories.length === initialLength) {
      res.status(404).json({
        success: false,
        message: `Sub-category "${subCategoryId}" not found in ${category.name}`,
      });
      return;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: `Sub-category deleted successfully from ${category.name}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete sub-category',
      error: error.message,
    });
  }
};
