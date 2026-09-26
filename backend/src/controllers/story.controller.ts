import { Request, Response } from 'express';
import Story, { IStory } from '../models/Story.model.js';

const INITIAL_STORIES = [
  {
    id: 'priya-patel-hair-growth',
    storyType: 'video',
    customer: 'Priya Patel',
    location: 'Surat, Gujarat',
    title: "Priya Patel's Hair Care Transformation",
    formulation: 'Herbal Kesh Sanjivani Hair Oil',
    productId: 'ayurvedic-hair-growth-oil',
    mainCategory: 'hair-care',
    subCategory: 'hair-oils',
    duration: '6 Weeks Treatment',
    rating: 5,
    comment:
      'After trying countless synthetic shampoos without results, I discovered Labdhi Herbs. Within 3 weeks of using Herbal Kesh Sanjivani Hair Oil, hair fall reduced drastically and new baby hair growth began!',
    beforeImage:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    afterImage:
      'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
    videoUrl: '/videos/Create_a_premium_cinematic_bra.mp4',
    videoPoster:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1400',
    featured: true,
    verified: true,
    status: 'active',
    order: 1,
  },
  {
    id: 'meera-kothari-acne-clearance',
    storyType: 'photo',
    customer: 'Meera Kothari',
    location: 'Surat, Gujarat',
    title: 'Acne Scars & Deep Blemish Clearance',
    formulation: 'Beautiction Face Pack',
    productId: 'beautiction-face-pack',
    mainCategory: 'skin-face-care',
    subCategory: 'face-packs',
    duration: '4 Weeks Treatment',
    rating: 5,
    comment:
      'Deep acne marks faded by 85%. Skin feels so smooth and naturally radiant without any harsh chemical peels.',
    beforeImage:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    afterImage:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    videoUrl: '',
    videoPoster: '',
    featured: false,
    verified: true,
    status: 'active',
    order: 2,
  },
  {
    id: 'rajesh-shah-eczema-relief',
    storyType: 'photo',
    customer: 'Rajesh Shah',
    location: 'Vadodara, Gujarat',
    title: 'Dry Skin Texture & Eczema Relief',
    formulation: 'Soft N Silky Skincare Ointment',
    productId: 'soft-n-silky-skincare-ointment',
    mainCategory: 'skin-face-care',
    subCategory: 'skin-ointments',
    duration: '3 Weeks Treatment',
    rating: 5,
    comment:
      'Instant relief from dry skin itching and winter flakiness. My whole family uses this formulation daily now.',
    beforeImage:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    afterImage:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
    videoUrl: '',
    videoPoster: '',
    featured: false,
    verified: true,
    status: 'active',
    order: 3,
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

const ensureSeedStories = async () => {
  // Auto-seeding disabled so deleted stories never re-appear on restart
  return;
};

/**
 * @desc Get all active success stories for storefront
 * @route GET /api/v1/stories or /api/public/stories
 * @access Public
 */
export const getStories = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureSeedStories();

    const { type, category, mainCategory, subCategory } = _req.query;
    const filter: any = { status: 'active' };
    if (type === 'photo' || type === 'video') {
      filter.storyType = type;
    }

    const catFilter = (mainCategory || category) as string | undefined;
    if (catFilter && catFilter !== 'all') {
      filter.$or = [
        { mainCategory: catFilter },
        { mainCategory: { $regex: new RegExp(`^${catFilter.replace(/-/g, '[-\\s]')}$`, 'i') } },
      ];
    }

    if (subCategory && (subCategory as string) !== 'all') {
      const subCatStr = subCategory as string;
      const subRegex = new RegExp(`^${subCatStr.replace(/-/g, '[-\\s]')}$`, 'i');
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: [{ subCategory: subCatStr }, { subCategory: { $regex: subRegex } }] },
        ];
        delete filter.$or;
      } else {
        filter.$or = [
          { subCategory: subCatStr },
          { subCategory: { $regex: subRegex } },
        ];
      }
    }

    const stories = await Story.find(filter)
      .sort({
        featured: -1,
        order: 1,
        createdAt: -1,
      })
      .lean();

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch success stories',
      error: error.message,
    });
  }
};

/**
 * @desc Get all success stories for Admin Dashboard (includes inactive, stats)
 * @route GET /api/v1/stories/admin/all
 * @access Private (Admin)
 */
export const getAdminStories = async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureSeedStories();

    const { type, category, mainCategory, subCategory } = _req.query;
    const filter: any = {};
    if (type === 'photo' || type === 'video') {
      filter.storyType = type;
    }

    const catFilter = (mainCategory || category) as string | undefined;
    if (catFilter && catFilter !== 'all') {
      filter.$or = [
        { mainCategory: catFilter },
        { mainCategory: { $regex: new RegExp(`^${catFilter.replace(/-/g, '[-\\s]')}$`, 'i') } },
      ];
    }

    if (subCategory && (subCategory as string) !== 'all') {
      const subCatStr = subCategory as string;
      const subRegex = new RegExp(`^${subCatStr.replace(/-/g, '[-\\s]')}$`, 'i');
      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: [{ subCategory: subCatStr }, { subCategory: { $regex: subRegex } }] },
        ];
        delete filter.$or;
      } else {
        filter.$or = [
          { subCategory: subCatStr },
          { subCategory: { $regex: subRegex } },
        ];
      }
    }

    const stories = await Story.find(filter).sort({ order: 1, createdAt: -1 });
    const allStories = type || catFilter || subCategory ? await Story.find() : stories;

    const stats = {
      totalStories: allStories.length,
      activeStories: allStories.filter((s) => s.status === 'active').length,
      inactiveStories: allStories.filter((s) => s.status === 'inactive').length,
      photoStories: allStories.filter((s) => s.storyType === 'photo').length,
      videoStories: allStories.filter(
        (s) => s.storyType === 'video' || Boolean(s.videoUrl && s.videoUrl.trim().length > 0)
      ).length,
      featuredStories: allStories.filter((s) => s.featured).length,
    };

    res.status(200).json({
      success: true,
      stats,
      data: stories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin success stories',
      error: error.message,
    });
  }
};

/**
 * @desc Create a new success story
 * @route POST /api/v1/stories
 * @access Private (Admin)
 */
export const createStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      storyType = 'photo',
      customer,
      location,
      title,
      formulation,
      productId,
      mainCategory,
      subCategory,
      duration,
      rating,
      comment,
      beforeImage,
      afterImage,
      videoUrl,
      videoPoster,
      featured,
      verified,
      status,
      order,
    } = req.body;

    if (!customer || !title || !formulation || !comment) {
      res.status(400).json({
        success: false,
        message: 'Customer name, title, formulation, and comment are required',
      });
      return;
    }

    const resolvedType = storyType === 'video' ? 'video' : 'photo';

    if (resolvedType === 'video' && (!videoUrl || videoUrl.trim() === '')) {
      res.status(400).json({
        success: false,
        message: 'A video file or URL is required for customer video stories',
      });
      return;
    }

    if (resolvedType === 'photo' && (!beforeImage || !afterImage)) {
      res.status(400).json({
        success: false,
        message:
          'Both Before photo and After photo are required for transformation photo stories',
      });
      return;
    }

    const baseSlug = generateSlug(`${customer}-${title}`) || `story-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Story.findOne({ id: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const count = await Story.countDocuments();

    const newStory = await Story.create({
      id: uniqueSlug,
      storyType: resolvedType,
      customer: customer.trim(),
      location: location ? location.trim() : 'Surat, Gujarat',
      title: title.trim(),
      formulation: formulation.trim(),
      productId: productId ? productId.trim() : '',
      mainCategory: mainCategory ? mainCategory.trim() : '',
      subCategory: subCategory ? subCategory.trim() : '',
      duration: duration ? duration.trim() : '4 Weeks Treatment',
      rating: rating ? Number(rating) : 5,
      comment: comment.trim(),
      beforeImage: beforeImage ? beforeImage.trim() : '',
      afterImage: afterImage ? afterImage.trim() : '',
      videoUrl: videoUrl ? videoUrl.trim() : '',
      videoPoster: videoPoster ? videoPoster.trim() : '',
      featured: Boolean(featured),
      verified: verified !== undefined ? Boolean(verified) : true,
      status: status === 'inactive' ? 'inactive' : 'active',
      order: order !== undefined ? Number(order) : count + 1,
    });

    res.status(201).json({
      success: true,
      message: `${resolvedType === 'video' ? 'Video story' : 'Transformation photo story'} created successfully`,
      data: newStory,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create success story',
      error: error.message,
    });
  }
};

/**
 * @desc Update a success story
 * @route PUT /api/v1/stories/:id
 * @access Private (Admin)
 */
export const updateStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const story = await Story.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Success story not found',
      });
      return;
    }

    const updates = req.body;
    delete updates._id;
    delete updates.id; // Keep immutable slug identifier

    Object.keys(updates).forEach((key) => {
      (story as any)[key] = updates[key];
    });

    await story.save();

    res.status(200).json({
      success: true,
      message: 'Success story updated successfully',
      data: story,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update success story',
      error: error.message,
    });
  }
};

/**
 * @desc Toggle story status (active/inactive)
 * @route PATCH /api/v1/stories/:id/status
 * @access Private (Admin)
 */
export const toggleStoryStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const story = await Story.findOne({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Success story not found',
      });
      return;
    }

    story.status = story.status === 'active' ? 'inactive' : 'active';
    await story.save();

    res.status(200).json({
      success: true,
      message: `Story is now ${story.status}`,
      data: story,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle story status',
      error: error.message,
    });
  }
};

/**
 * @desc Delete a success story
 * @route DELETE /api/v1/stories/:id
 * @access Private (Admin)
 */
export const deleteStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const story = await Story.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!story) {
      res.status(404).json({
        success: false,
        message: 'Success story not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Success story deleted successfully',
      data: { id: story.id },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete success story',
      error: error.message,
    });
  }
};
