import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Us — Handcrafted Ayurvedic Heritage in Surat',
  description:
    'Discover the story of Labdhi Herbs, founded in Surat, Gujarat. Learn about our 100% chemical-free Ayurvedic hair care, skin care, and joint care formulations.',
  alternates: {
    canonical: 'https://labdhiherbs.com/about',
  },
  openGraph: {
    title: 'About Us | Labdhi Herbs',
    description:
      'Discover the story of Labdhi Herbs, founded in Surat, Gujarat. Learn about our 100% chemical-free Ayurvedic hair care, skin care, and joint care formulations.',
    url: 'https://labdhiherbs.com/about',
  },
};

export default function AboutPage() {
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Labdhi Herbs',
    url: 'https://labdhiherbs.com',
    logo: 'https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Surat',
      addressRegion: 'Gujarat',
      addressCountry: 'IN',
    },
    description:
      'Handcrafted 100% pure botanical Ayurvedic hair care, skin care, and pain relief formulations from Surat, Gujarat.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <AboutClient />
    </>
  );
}
