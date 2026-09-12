import type { Metadata } from 'next';
import AdminDiscountsClient from './AdminDiscountsClient';

export const metadata: Metadata = {
  title: 'Discount Management | Labdhi Herbs Admin',
  description: 'Manage promotional coupons, discount rules, minimum purchase requirements, and validity dates.',
};

export default function AdminDiscountsPage() {
  return <AdminDiscountsClient />;
}
