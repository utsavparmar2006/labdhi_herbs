import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { Product } from './Product.model.js';

export interface IReview extends Document {
  productId: string; // Product id / slug (e.g. "beautiction-face-pack")
  userId?: Types.ObjectId; // Optional authenticated user reference
  name: string;
  email: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  images: string[];
  recommend: boolean;
  status: 'approved' | 'pending' | 'rejected';
  helpfulCount: number;
  helpfulUsers: string[];
  adminReply?: {
    message: string;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface IReviewModel extends Model<IReview> {
  calcAverageRating(productId: string): Promise<void>;
}

const ReviewSchema = new Schema<IReview, IReviewModel>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      index: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Reviewer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Reviewer email is required'],
      lowercase: true,
      trim: true,
      maxlength: [150, 'Email cannot exceed 150 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [3000, 'Review comment cannot exceed 3000 characters'],
    },
    images: {
      type: [String],
      default: [],
    },
    recommend: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'approved',
      index: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    helpfulUsers: {
      type: [String],
      default: [],
    },
    adminReply: {
      message: { type: String, trim: true },
      repliedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries on product page
ReviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

// Static method to recalculate product average rating and count
ReviewSchema.statics.calcAverageRating = async function (productId: string) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          productId: productId,
          status: 'approved',
        },
      },
      {
        $group: {
          _id: '$productId',
          reviewsCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      const roundedRating = Math.round(stats[0].avgRating * 10) / 10;
      await Product.findOneAndUpdate(
        { id: productId },
        {
          rating: roundedRating,
          reviewsCount: stats[0].reviewsCount,
        }
      );
    } else {
      // If no approved reviews exist, maintain 5.0 default rating and 0 count
      await Product.findOneAndUpdate(
        { id: productId },
        {
          rating: 5.0,
          reviewsCount: 0,
        }
      );
    }
  } catch (error) {
    console.error(`Error calculating average rating for product ${productId}:`, error);
  }
};

// Post-save hook to recalculate product rating
ReviewSchema.post('save', async function () {
  const model = this.constructor as IReviewModel;
  await model.calcAverageRating(this.productId);
});

export const Review = mongoose.model<IReview, IReviewModel>('Review', ReviewSchema);
