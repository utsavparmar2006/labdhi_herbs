import type { Metadata } from 'next';
import OrderSuccessClient from './OrderSuccessClient';

export const metadata: Metadata = {
  title: 'Order Confirmed — Thank You | Labdhi Herbs',
  description: 'Your herbal formulation order has been confirmed. View receipt and delivery timeline.',
  robots: {
    index: false,
    follow: false,
  },
};

interface OrderSuccessPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  return <OrderSuccessClient orderId={params.orderId} />;
}
