import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy | Labdhi Herbs',
  description:
    'Learn about Labdhi Herbs nationwide delivery timelines, packaging, tracking, and courier partners from Surat, Gujarat.',
  alternates: {
    canonical: 'https://labdhiherbs.com/shipping',
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
