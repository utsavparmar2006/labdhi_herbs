import { Metadata } from 'next';
import AdminBlogClient from './AdminBlogClient';

export const metadata: Metadata = {
  title: 'Manage Blog & Herbal Journal | Admin Dashboard | Labdhi Herbs',
  description:
    'Create, edit, and publish Ayurvedic wellness guides, botanical care articles, and educational journal posts.',
};

export default function AdminBlogPage() {
  return <AdminBlogClient />;
}
