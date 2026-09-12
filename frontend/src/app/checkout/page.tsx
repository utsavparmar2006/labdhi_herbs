import type { Metadata } from 'next';
import CheckoutClient from './CheckoutClient';

export const metadata: Metadata = {
  title: 'Secure Checkout — 100% Herbal Formulations | Labdhi Herbs',
  description: 'Complete your order for authentic Ayurvedic formulations with free all-India shipping and Cash on Delivery.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
