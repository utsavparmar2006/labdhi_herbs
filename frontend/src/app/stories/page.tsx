import type { Metadata } from 'next';
import StoriesClient from './StoriesClient';

export const metadata: Metadata = {
  title: 'Success Stories & Photo Gallery',
  description:
    'Discover authentic customer experiences, video testimonials, and photo gallery of Labdhi Herbs pure Ayurvedic formulations from Surat, Gujarat.',
  alternates: {
    canonical: 'https://labdhiherbs.com/stories',
  },
  openGraph: {
    title: 'Success Stories & Photo Gallery | Labdhi Herbs',
    description:
      'Discover authentic customer experiences, video testimonials, and photo gallery of Labdhi Herbs pure Ayurvedic formulations from Surat, Gujarat.',
    url: 'https://labdhiherbs.com/stories',
  },
};

export default function StoriesPage() {
  const jsonLdReview = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Labdhi Herbs Customer Success Stories',
    itemListElement: [
      {
        '@type': 'Review',
        itemReviewed: {
          '@type': 'Product',
          name: 'Herbal Kesh Sanjivani Hair Oil',
        },
        author: {
          '@type': 'Person',
          name: 'Priya Patel',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
        },
        reviewBody:
          'The Herbal Kesh Sanjivani Hair Oil is magical! Hair fall reduced by 80% within 3 weeks. Authentic Gujarati Ayurveda at its finest.',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdReview) }}
      />
      <StoriesClient />
    </>
  );
}
