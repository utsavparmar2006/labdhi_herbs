import mongoose, { Schema, Document } from 'mongoose';

export interface ICartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
  quantity: number;
  price: number;
  total: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  customer?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  items: ICartItem[];
  subtotal: number;
  status: 'active' | 'converted' | 'abandoned';
  abandonedAt?: Date;
  recoveryRemindersCount: number;
  lastReminderSentAt?: Date;
  lastActivityAt: Date;
  recoveryCoupon?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema(
  {
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, default: '' },
      category: { type: String, default: 'Herbal Care' },
    },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CartSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestId: { type: String, index: true },
    customer: {
      fullName: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, lowercase: true, default: '' },
      phone: { type: String, trim: true, default: '' },
    },
    items: { type: [CartItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'converted', 'abandoned'],
      default: 'active',
      index: true,
    },
    abandonedAt: { type: Date },
    recoveryRemindersCount: { type: Number, default: 0 },
    lastReminderSentAt: { type: Date },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    recoveryCoupon: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

CartSchema.index({ status: 1, lastActivityAt: -1 });
CartSchema.index({ 'customer.email': 1 });
CartSchema.index({ 'customer.phone': 1 });

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
