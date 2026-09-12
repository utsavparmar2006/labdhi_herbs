import type { Metadata } from 'next';
import AdminHomePageClient from './AdminHomePageClient';

export const metadata: Metadata = {
  title: 'Home Page CMS & Hero Line | Labdhi Herbs Admin',
  description: 'Manage the home page hero line, top announcements, and hero banner in real-time.',
};

export default function AdminHomePage() {
  return <AdminHomePageClient />;
}
