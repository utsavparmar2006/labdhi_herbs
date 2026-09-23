import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  id: string; // url slug e.g. "beautiction-face-pack"
  name: string;
  category: string; // e.g. "Face Care"
  categoryId: string; // e.g. "face-care"
  mainCategory: string; // e.g. "Skin & Face Care"
  subCategory: string; // e.g. "Face Packs & Ubtan"
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  hoverImage?: string;
  images?: string[];
  tag?: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  usage: string;
  inStock: boolean;
  featured: boolean;
  videoUrl?: string;
  howToUseVideoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    categoryId: { type: String, required: true, index: true },
    mainCategory: { type: String, required: true, index: true },
    subCategory: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    image: { type: String, required: true },
    hoverImage: { type: String, default: '' },
    images: { type: [String], default: [] },
    videoUrl: { type: String, default: '' },
    howToUseVideoUrl: { type: String, default: '' },
    tag: { type: String, default: '' },
    description: { type: String, default: '' },
    benefits: { type: [String], default: [] },
    ingredients: { type: [String], default: [] },
    usage: { type: String, default: '' },
    inStock: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true, id: false }
);

// Compound indexes for optimal catalog querying and sorting
ProductSchema.index({ mainCategory: 1, subCategory: 1, inStock: 1 });
ProductSchema.index({ categoryId: 1, inStock: 1 });
ProductSchema.index({ featured: 1, inStock: 1 });
ProductSchema.index({ createdAt: -1 });

ProductSchema.pre('validate', function (next) {
  if (!this.id && this.name) {
    const raw = String(this.name);
    this.id = raw
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
