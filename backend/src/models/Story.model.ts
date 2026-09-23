import mongoose, { Document, Schema } from 'mongoose';

export interface IStory extends Document {
  id: string;
  storyType: 'photo' | 'video';
  customer: string;
  location: string;
  title: string;
  formulation: string;
  productId?: string;
  duration?: string;
  rating: number;
  comment: string;
  beforeImage: string;
  afterImage: string;
  videoUrl?: string;
  videoPoster?: string;
  additionalVideos?: { url: string; poster?: string; label?: string }[];
  featured: boolean;
  verified: boolean;
  status: 'active' | 'inactive';
  order: number;
  mainCategory?: string;
  subCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    storyType: {
      type: String,
      enum: ['photo', 'video'],
      default: 'photo',
      index: true,
    },
    customer: { type: String, required: true, trim: true },
    location: { type: String, default: 'Surat, Gujarat', trim: true },
    title: { type: String, required: true, trim: true },
    formulation: { type: String, required: true, trim: true },
    productId: { type: String, default: '' },
    duration: { type: String, default: '4 Weeks Treatment', trim: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    beforeImage: { type: String, default: '' },
    afterImage: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    videoPoster: { type: String, default: '' },
    additionalVideos: {
      type: [
        {
          url: { type: String, required: true },
          poster: { type: String, default: '' },
          label: { type: String, default: '' },
        },
      ],
      default: [],
    },
    featured: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    mainCategory: { type: String, default: '', index: true, trim: true },
    subCategory: { type: String, default: '', index: true, trim: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, id: false }
);

export const Story = mongoose.model<IStory>('Story', StorySchema);
export default Story;
