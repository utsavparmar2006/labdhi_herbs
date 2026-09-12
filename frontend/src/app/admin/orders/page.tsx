import type { Metadata } from 'next';
import AdminOrdersClient from './AdminOrdersClient';

export const metadata: Metadata = {
  title: 'Orders & Shipments Management — Admin Panel | Labdhi Herbs',
  description: 'Track, manage, and fulfill customer herbal product orders.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOrdersPage() {
  return <AdminOrdersClient />;
}
