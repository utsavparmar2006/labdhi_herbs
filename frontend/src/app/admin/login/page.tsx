import type { Metadata } from 'next';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Portal Login — Labdhi Herbs Operations',
  description: 'Authorized administrative portal login for Labdhi Herbs management dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}
