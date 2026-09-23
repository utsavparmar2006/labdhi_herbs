import type { Metadata } from 'next';
import AdminSubscribersClient from './AdminSubscribersClient';

export const metadata: Metadata = {
  title: 'Subscribers & WhatsApp Leads — Admin Panel | Labdhi Herbs',
  description: 'Manage captured leads, welcome coupons, and auto-responder email/WhatsApp messages.',
};

export default function AdminSubscribersPage() {
  return <AdminSubscribersClient />;
}
