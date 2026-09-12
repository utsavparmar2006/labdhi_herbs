import mongoose, { Document, Schema } from 'mongoose';

export interface ISubCategory {
  id: string;
  name: string;
  slug: string;
  mainCategoryId: string;
  image?: string;
  description?: string;
  itemCount?: number;
}

export interface ICategory extends Document {
  id: string; // url slug identifier (e.g. 'skin-face-care')
  name: string; // 'Skin & Face Care'
  slug: string;
  description: string;
  image?: string;
  status: 'active' | 'inactive';
  order: number;
  subCategories: ISubCategory[];
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    mainCategoryId: { type: String, required: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    itemCount: { type: Number, default: 0 },
  },
  { _id: false, id: false }
);

const CategorySchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    order: { type: Number, default: 0 },
    subCategories: { type: [SubCategorySchema], default: [] },
  },
  { timestamps: true, id: false }
);

CategorySchema.pre('validate', function (next) {
  if (!this.id) {
    const raw = String(this.slug || this.name || this._id || '');
    this.id = raw
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
