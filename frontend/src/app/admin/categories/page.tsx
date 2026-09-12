import type { Metadata } from 'next';
import AdminCategoriesClient from './AdminCategoriesClient';

export const metadata: Metadata = {
  title: 'Manage Categories | Labdhi Herbs Admin',
  description: 'Create, update, and manage product categories and sub-categories in real-time.',
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesClient />;
}
