import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Labdhi Herbs',
  description:
    'Read the terms of service, guidelines, and conditions for purchasing pure Ayurvedic formulations from Labdhi Herbs.',
  alternates: {
    canonical: 'https://labdhiherbs.com/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
