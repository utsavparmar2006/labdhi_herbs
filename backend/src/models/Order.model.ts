import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
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

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IPricing {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface IPayment {
  method: 'cod' | 'online';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  paidAt?: Date;
}

export interface IOrder extends Document {
  orderId: string; // e.g. "LH-2026-94821"
  user?: mongoose.Types.ObjectId;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  pricing: IPricing;
  couponCode?: string;
  payment: IPayment;
  orderStatus: 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
      category: { type: String, default: 'Herbal Care' },
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const PricingSchema = new Schema<IPricing>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    method: { type: String, enum: ['cod', 'online'], default: 'cod' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer: {
      fullName: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true, index: true },
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    items: { type: [OrderItemSchema], required: true, default: [] },
    pricing: { type: PricingSchema, required: true },
    couponCode: { type: String, default: '', trim: true, uppercase: true },
    payment: { type: PaymentSchema, required: true },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
      index: true,
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
