import type { Metadata } from 'next';
import AdminReviewsClient from './AdminReviewsClient';

export const metadata: Metadata = {
  title: 'Product Reviews Management — Labdhi Herbs Admin Panel',
  description: 'Manage and moderate customer product reviews, ratings, and merchant responses.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminReviewsPage() {
  return <AdminReviewsClient />;
}
