import { Metadata } from 'next';
import AdminStoriesClient from './AdminStoriesClient';

export const metadata: Metadata = {
  title: 'Manage Customer Success Stories | Admin Dashboard | Labdhi Herbs',
  description: 'Manage before and after transformations, verified customer stories, and video testimonials.',
};

export default function AdminStoriesPage() {
  return <AdminStoriesClient />;
}
