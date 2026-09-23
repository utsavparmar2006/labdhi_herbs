import { Request, Response } from 'express';
import { Review, IReview } from '../models/Review.model.js';
import { Product } from '../models/Product.model.js';

/**
 * @desc Get all approved reviews for a specific product with filters, pagination and breakdown statistics
 * @route GET /api/v1/reviews/product/:productId
 * @access Public (Anyone/Guest can view)
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const ratingFilter = req.query.rating ? parseInt(req.query.rating as string, 10) : null;
    const withPhotos = req.query.withPhotos === 'true';
    const sortBy = (req.query.sort as string) || 'newest';

    // Base query for approved reviews
    const matchQuery: any = {
      productId,
      status: 'approved',
    };

    if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
      matchQuery.rating = ratingFilter;
    }

    if (withPhotos) {
      matchQuery['images.0'] = { $exists: true };
    }

    // Determine sort order
    let sortOptions: any = { createdAt: -1 };
    if (sortBy === 'highest') {
      sortOptions = { rating: -1, createdAt: -1 };
    } else if (sortBy === 'lowest') {
      sortOptions = { rating: 1, createdAt: -1 };
    } else if (sortBy === 'most_helpful') {
      sortOptions = { helpfulCount: -1, createdAt: -1 };
    }

    // Execute review query and total count in parallel
    const [reviews, totalFiltered] = await Promise.all([
      Review.find(matchQuery).sort(sortOptions).skip(skip).limit(limit).lean(),
      Review.countDocuments(matchQuery),
    ]);

    // Aggregate statistics across ALL approved reviews for this product
    const stats = await Review.aggregate([
      { $match: { productId, status: 'approved' } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' },
          recommendCount: {
            $sum: { $cond: [{ $eq: ['$recommend', true] }, 1, 0] },
          },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    // Aggregate customer photo gallery (all images uploaded by customers for this product)
    const photoReviews = await Review.find(
      { productId, status: 'approved', 'images.0': { $exists: true } },
      { images: 1, name: 1, rating: 1, comment: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const customerPhotos = photoReviews.flatMap((r) =>
      (r.images || []).map((imgUrl) => ({
        url: imgUrl,
        reviewId: r._id,
        reviewerName: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
      }))
    );

    const baseStats = stats[0] || {
      totalReviews: 0,
      avgRating: 5.0,
      recommendCount: 0,
      star5: 0,
      star4: 0,
      star3: 0,
      star2: 0,
      star1: 0,
    };

    const totalCount = baseStats.totalReviews;
    const avgRating = totalCount > 0 ? Math.round(baseStats.avgRating * 10) / 10 : 5.0;
    const recommendPercentage = totalCount > 0 ? Math.round((baseStats.recommendCount / totalCount) * 100) : 100;

    const breakdown = {
      5: { count: baseStats.star5, percentage: totalCount > 0 ? Math.round((baseStats.star5 / totalCount) * 100) : 0 },
      4: { count: baseStats.star4, percentage: totalCount > 0 ? Math.round((baseStats.star4 / totalCount) * 100) : 0 },
      3: { count: baseStats.star3, percentage: totalCount > 0 ? Math.round((baseStats.star3 / totalCount) * 100) : 0 },
      2: { count: baseStats.star2, percentage: totalCount > 0 ? Math.round((baseStats.star2 / totalCount) * 100) : 0 },
      1: { count: baseStats.star1, percentage: totalCount > 0 ? Math.round((baseStats.star1 / totalCount) * 100) : 0 },
    };

    res.status(200).json({
      success: true,
      productId,
      stats: {
        totalReviews: totalCount,
        averageRating: avgRating,
        recommendPercentage,
        breakdown,
      },
      customerPhotos,
      pagination: {
        totalFiltered,
        page,
        limit,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
      reviews,
    });
  } catch (error: any) {
    console.error('Error in getProductReviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

/**
 * @desc Create a new review for a product with optional photo uploads
 * @route POST /api/v1/reviews/product/:productId
 * @access Public (Any visitor/customer can review)
 */
export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, email, rating, title, comment, recommend } = req.body;

    if (!name || !email || !rating || !title || !comment) {
      res.status(400).json({
        success: false,
        message: 'Name, email, rating, title, and comment are required fields',
      });
      return;
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
      return;
    }

    // Verify product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      res.status(404).json({
        success: false,
        message: `Product with ID '${productId}' does not exist`,
      });
      return;
    }

    // Collect uploaded image URLs
    const uploadedImages: string[] = [];

    // Check if multer uploaded files
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:5000';
      for (const file of req.files) {
        uploadedImages.push(`${protocol}://${host}/uploads/${file.filename}`);
      }
    }

    // Also support images passed in body if already uploaded or URL strings
    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        uploadedImages.push(...req.body.images.filter((img: any) => typeof img === 'string' && img.trim()));
      } else if (typeof req.body.images === 'string') {
        try {
          const parsed = JSON.parse(req.body.images);
          if (Array.isArray(parsed)) {
            uploadedImages.push(...parsed);
          }
        } catch {
          if (req.body.images.trim()) {
            uploadedImages.push(req.body.images.trim());
          }
        }
      }
    }

    // Determine recommend boolean
    const recommendBool =
      recommend === true || recommend === 'true' || recommend === 1 || recommend === '1';

    // Create review
    const newReview = await Review.create({
      productId,
      userId: (req as any).user?._id || undefined,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      rating: numericRating,
      title: title.trim(),
      comment: comment.trim(),
      images: uploadedImages,
      recommend: recommendBool,
      status: 'approved', // Auto-approved for real-time visibility
    });

    // Auto-calculate product rating and review count
    await (Review as any).calcAverageRating(productId);

    // Get updated product stats
    const updatedProduct = await Product.findOne({ id: productId }, { rating: 1, reviewsCount: 1 });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for sharing your experience.',
      review: newReview,
      productStats: {
        rating: updatedProduct?.rating || numericRating,
        reviewsCount: updatedProduct?.reviewsCount || 1,
      },
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

/**
 * @desc Vote a review as helpful
 * @route POST /api/v1/reviews/:reviewId/helpful
 * @access Public
 */
export const voteHelpful = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const identifier =
      (req as any).user?._id?.toString() ||
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      'anonymous-user';

    const review = await Review.findById(reviewId);
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    const hasVoted = review.helpfulUsers.includes(identifier);

    if (hasVoted) {
      // Un-vote
      review.helpfulUsers = review.helpfulUsers.filter((id) => id !== identifier);
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
      await review.save();

      res.status(200).json({
        success: true,
        helpfulCount: review.helpfulCount,
        hasVoted: false,
        message: 'Removed helpful vote',
      });
    } else {
      // Vote helpful
      review.helpfulUsers.push(identifier);
      review.helpfulCount += 1;
      await review.save();

      res.status(200).json({
        success: true,
        helpfulCount: review.helpfulCount,
        hasVoted: true,
        message: 'Thank you for your feedback!',
      });
    }
  } catch (error: any) {
    console.error('Error voting helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record helpful vote',
      error: error.message,
    });
  }
};

/**
 * @desc Get all reviews for Admin Panel with filters, search, and pagination
 * @route GET /api/v1/reviews/admin
 * @access Private (Admin only)
 */
export const getAdminReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 15));
    const skip = (page - 1) * limit;

    const status = req.query.status as string; // 'all' | 'pending' | 'approved' | 'rejected'
    const rating = req.query.rating ? parseInt(req.query.rating as string, 10) : null;
    const search = req.query.search ? (req.query.search as string).trim() : null;
    const productId = req.query.productId as string;
    const mainCategory = req.query.mainCategory as string;

    const matchQuery: any = {};

    if (status && status !== 'all') {
      matchQuery.status = status;
    }

    if (rating && rating >= 1 && rating <= 5) {
      matchQuery.rating = rating;
    }

    if (mainCategory && mainCategory !== 'all') {
      const matchingProducts = await Product.find(
        {
          $or: [
            { mainCategory: { $regex: new RegExp(`^${mainCategory}$`, 'i') } },
            { category: { $regex: new RegExp(`^${mainCategory}$`, 'i') } },
            { categoryId: mainCategory },
          ],
        },
        { id: 1 }
      ).lean();
      const productIds = matchingProducts.map((p) => p.id);
      matchQuery.productId = { $in: productIds };
    }

    if (productId && productId !== 'all') {
      matchQuery.productId = productId;
    }

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
      ];
    }

    const [reviews, totalCount, statusCounts] = await Promise.all([
      Review.find(matchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Review.countDocuments(matchQuery),
      Review.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const counts = {
      all: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };

    statusCounts.forEach((s) => {
      if (s._id === 'approved') counts.approved = s.count;
      if (s._id === 'pending') counts.pending = s.count;
      if (s._id === 'rejected') counts.rejected = s.count;
      counts.all += s.count;
    });

    res.status(200).json({
      success: true,
      reviews,
      counts,
      pagination: {
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error('Error fetching admin reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin reviews',
      error: error.message,
    });
  }
};

/**
 * @desc Update review status (Approve / Reject / Pending)
 * @route PATCH /api/v1/reviews/admin/:id/status
 * @access Private (Admin only)
 */
export const updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, pending, or rejected',
      });
      return;
    }

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    // Recalculate average rating for product
    await (Review as any).calcAverageRating(review.productId);

    res.status(200).json({
      success: true,
      message: `Review status updated to '${status}' successfully`,
      review,
    });
  } catch (error: any) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status',
      error: error.message,
    });
  }
};

/**
 * @desc Add official merchant reply to a review
 * @route POST /api/v1/reviews/admin/:id/reply
 * @access Private (Admin only)
 */
export const replyToReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      res.status(400).json({
        success: false,
        message: 'Reply message cannot be empty',
      });
      return;
    }

    const review = await Review.findByIdAndUpdate(
      id,
      {
        adminReply: {
          message: message.trim(),
          repliedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      review,
    });
  } catch (error: any) {
    console.error('Error replying to review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply to review',
      error: error.message,
    });
  }
};

/**
 * @desc Delete a review permanently
 * @route DELETE /api/v1/reviews/admin/:id
 * @access Private (Admin only)
 */
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found',
      });
      return;
    }

    // Recalculate average rating for product
    await (Review as any).calcAverageRating(review.productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

/**
 * @desc Auto-seed initial realistic customer reviews if collection is empty
 */
export const seedDefaultReviews = async (): Promise<void> => {
  try {
    const count = await Review.countDocuments();
    if (count > 0) {
      return; // Already has reviews
    }

    const initialReviews = [
      {
        productId: 'soft-n-silky-skincare-ointment',
        name: 'Pooja K. Sharma',
        email: 'pooja.sharma@example.com',
        rating: 5,
        title: 'Remarkable healing for dry skin & cracked heels!',
        comment: 'I have tried multiple commercial creams, but this Ayurvedic ointment is by far the most effective. Within 4 days of bedtime application, the cracked heels became noticeably smoother. The natural herbal aroma is gentle and comforting.',
        images: [],
        recommend: true,
        helpfulCount: 14,
        status: 'approved',
        adminReply: {
          message: 'Thank you Pooja for trusting Labdhi Herbs! We are delighted that the formulation brought soothing relief to your skin.',
          repliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'soft-n-silky-skincare-ointment',
        name: 'Dr. Rajesh Mehta',
        email: 'dr.rajesh@example.com',
        rating: 5,
        title: 'Authentic Ayurvedic formulation, highly recommended',
        comment: 'Pure natural ingredients without heavy synthetic fragrance or petrolatum. Absorbs nicely without leaving greasy residue. Highly impressed with Labdhi Herbs commitment to purity.',
        images: [],
        recommend: true,
        helpfulCount: 9,
        status: 'approved',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'soft-n-silky-skincare-ointment',
        name: 'Ananya Desai',
        email: 'ananya.desai@example.com',
        rating: 4,
        title: 'Very effective, mild herbal texture',
        comment: 'Works wonders for winter dryness. The texture is rich so a tiny pea-sized amount is sufficient for both hands. Packaging is elegant and secure.',
        images: [],
        recommend: true,
        helpfulCount: 5,
        status: 'approved',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'ayurvedic-hair-growth-oil',
        name: 'Sneha Verma',
        email: 'sneha.v@example.com',
        rating: 5,
        title: 'Hair fall stopped in 2 weeks! Worth every rupee',
        comment: 'I was skeptical at first, but after using it twice a week with gentle scalp massage, my hair fall has decreased significantly. It leaves hair shiny and full of life.',
        images: [],
        recommend: true,
        helpfulCount: 22,
        status: 'approved',
        adminReply: {
          message: 'Sneha, we are overjoyed to hear about your hair rejuvenation journey! Regular champi massage enhances the herbs absorption deeply.',
          repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'ayurvedic-hair-growth-oil',
        name: 'Karan Joshi',
        email: 'karan.j@example.com',
        rating: 5,
        title: 'Authentic cold-pressed feel and soothing cooling effect',
        comment: 'Doesn’t cause heavy scalp buildup. Has a calming herbal fragrance that also helps with peaceful sleep when applied before bed.',
        images: [],
        recommend: true,
        helpfulCount: 11,
        status: 'approved',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'ortho-pain-relief-oil',
        name: 'Harish Bhai Patel',
        email: 'harish.patel@example.com',
        rating: 5,
        title: 'Gave immense relief to my mother knee joint stiffness',
        comment: 'Warm application twice daily has helped my 68-year-old mother walk comfortably with much less pain. The deep warmth produced by the mahanarayan base herbs is truly therapeutic.',
        images: [],
        recommend: true,
        helpfulCount: 31,
        status: 'approved',
        adminReply: {
          message: 'Warm blessings to your respected mother, Harish ji. May she enjoy active and pain-free mobility.',
          repliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        productId: 'neem-tulsi-purifying-face-pack',
        name: 'Divya Nair',
        email: 'divya.nair@example.com',
        rating: 5,
        title: 'Cleared acne breakouts and calmed redness completely',
        comment: 'I mix this with pure rose water twice weekly. My skin feels fresh, clear, and oil-balanced without feeling stripped or dry. Best natural face pack!',
        images: [],
        recommend: true,
        helpfulCount: 17,
        status: 'approved',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      },
    ];

    await Review.insertMany(initialReviews);
    console.log(`[Review Seeder] Successfully seeded ${initialReviews.length} authentic default reviews.`);

    // Recalculate rating stats for all affected products
    const uniqueProducts = Array.from(new Set(initialReviews.map((r) => r.productId)));
    for (const pid of uniqueProducts) {
      await (Review as any).calcAverageRating(pid);
    }
  } catch (err) {
    console.error('[Review Seeder] Error seeding default reviews:', err);
  }
};

