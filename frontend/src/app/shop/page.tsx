import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Shop All Pure Ayurvedic Formulations',
  description:
    'Explore Labdhi Herbs full collection of 100% pure Ayurvedic formulations for hair care, skin care, muscle care, and joint health.',
  alternates: {
    canonical: 'https://labdhiherbs.com/shop',
  },
  openGraph: {
    title: 'Shop All Pure Ayurvedic Formulations | Labdhi Herbs',
    description:
      'Explore Labdhi Herbs full collection of 100% pure Ayurvedic formulations for hair care, skin care, muscle care, and joint health.',
    url: 'https://labdhiherbs.com/shop',
  },
};

export default function ShopPage() {
  return <ShopClient />;
}
