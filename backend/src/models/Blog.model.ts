import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  readTime: string;
  date: string;
  featured: boolean;
  showOnHome: boolean;
  status: 'published' | 'draft';
  order: number;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, default: '', trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Wellness',
      index: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
      default: 'Dr. Labdhi Parmar (Ayurvedic Specialist)',
    },
    image: { type: String, required: true, trim: true },
    readTime: { type: String, default: '5 min read', trim: true },
    date: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false, index: true },
    showOnHome: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
      index: true,
    },
    order: { type: Number, default: 0, index: true },
    tags: [{ type: String, trim: true }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true, id: false }
);

export const Blog = mongoose.model<IBlog>('Blog', BlogSchema);
export default Blog;
