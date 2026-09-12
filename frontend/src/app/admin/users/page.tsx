import type { Metadata } from 'next';
import AdminUsersClient from './AdminUsersClient';

export const metadata: Metadata = {
  title: 'User Management — Labdhi Herbs Admin Panel',
  description: 'Manage registered users, review account roles, and set access permissions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminUsersPage() {
  return <AdminUsersClient />;
}
