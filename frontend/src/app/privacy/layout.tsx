import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Labdhi Herbs',
  description:
    'Our commitment to safeguarding your personal data, order privacy, and secure transactions at Labdhi Herbs.',
  alternates: {
    canonical: 'https://labdhiherbs.com/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
