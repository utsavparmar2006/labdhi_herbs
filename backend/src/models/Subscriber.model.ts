import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'active' | 'unsubscribed';
  discountCode: string;
  emailStatus: 'sent' | 'simulated' | 'failed' | 'disabled';
  whatsappStatus: 'sent' | 'pending' | 'failed' | 'disabled';
  lastContactedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Customer WhatsApp / phone number is required'],
      trim: true,
      maxlength: 20,
    },
    source: {
      type: String,
      default: 'footer_newsletter',
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'unsubscribed'],
      default: 'active',
    },
    discountCode: {
      type: String,
      default: 'WELCOME10',
      trim: true,
    },
    emailStatus: {
      type: String,
      enum: ['sent', 'simulated', 'failed', 'disabled'],
      default: 'simulated',
    },
    whatsappStatus: {
      type: String,
      enum: ['sent', 'pending', 'failed', 'disabled'],
      default: 'pending',
    },
    lastContactedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for fast search and listing
SubscriberSchema.index({ phone: 1 });
SubscriberSchema.index({ createdAt: -1 });

export default mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);
