import { Metadata } from 'next';
import AdminProductsClient from './AdminProductsClient';

export const metadata: Metadata = {
  title: 'Products Management | Labdhi Herbs Admin',
  description: 'Manage herbal formulations, catalog pricing, and inventory.',
};

export default function AdminProductsPage() {
  return <AdminProductsClient />;
}
