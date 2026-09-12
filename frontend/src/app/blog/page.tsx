import type { Metadata } from 'next';
import BlogClient from './BlogClient';

export const metadata: Metadata = {
  title: 'The Herbal Journal — Ayurvedic Wellness & Botanical Care',
  description:
    'Explore time-tested Ayurvedic routines, botanical hair and skincare guides, and joint health tips from Labdhi Herbs herbalists in Surat, Gujarat.',
  alternates: {
    canonical: 'https://labdhiherbs.com/blog',
  },
  openGraph: {
    title: 'The Herbal Journal | Labdhi Herbs',
    description:
      'Explore time-tested Ayurvedic routines, botanical hair and skincare guides, and joint health tips from Labdhi Herbs herbalists in Surat, Gujarat.',
    url: 'https://labdhiherbs.com/blog',
  },
};

export default function BlogPage() {
  const jsonLdBlog = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'The Labdhi Herbs Journal',
    description: 'Ayurvedic wellness routines and herbal skincare and hair care guides.',
    publisher: {
      '@type': 'Organization',
      name: 'Labdhi Herbs',
      logo: 'https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlog) }}
      />
      <BlogClient />
    </>
  );
}
