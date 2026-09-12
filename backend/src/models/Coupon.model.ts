import mongoose, { Document, Schema } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';
export type MinimumRequirementType = 'none' | 'amount' | 'quantity';
export type CouponStatus = 'active' | 'inactive';

export interface ICoupon extends Document {
  code: string;
  type: DiscountType;
  value: number; // e.g., 10 for 10%, 50 for ₹50, 0 for free shipping
  minimumRequirement: MinimumRequirementType;
  minAmount: number;
  minQuantity: number;
  onlinePaymentOnly: boolean;
  limitTotalUsage: boolean;
  totalUsageLimit?: number;
  usageCount: number;
  limitPerCustomer: boolean;
  usedBy: string[]; // customer IDs who have redeemed this coupon
  startDate: Date;
  endDate: Date;
  status: CouponStatus;
  showInList: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping'],
      default: 'percentage',
      required: true,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumRequirement: {
      type: String,
      enum: ['none', 'amount', 'quantity'],
      default: 'none',
      required: true,
    },
    minAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    minQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    onlinePaymentOnly: {
      type: Boolean,
      default: false,
    },
    limitTotalUsage: {
      type: Boolean,
      default: false,
    },
    totalUsageLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    limitPerCustomer: {
      type: Boolean,
      default: false,
    },
    usedBy: {
      type: [String],
      default: [],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
    showInList: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helpful virtual to check if coupon is currently expired or active
CouponSchema.virtual('isExpired').get(function (this: ICoupon) {
  return new Date() > this.endDate;
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
