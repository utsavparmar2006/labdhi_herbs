import { Metadata } from 'next';
import OrdersClient from './OrdersClient';

export const metadata: Metadata = {
  title: 'My Orders | Labdhi Herbs',
  description: 'View your Labdhi Herbs order history, live delivery tracking statuses, and download official receipts.',
};

export default function OrdersPage() {
  return <OrdersClient />;
}
