import type { Metadata } from 'next';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Labdhi Herbs',
  description:
    'Find answers to common questions about Labdhi Herbs 100% pure Ayurvedic formulations, dispatch from Surat, chemical-free ingredients, and deliveries.',
  alternates: {
    canonical: 'https://labdhiherbs.com/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) | Labdhi Herbs',
    description:
      'Find answers to common questions about Labdhi Herbs 100% pure Ayurvedic formulations, dispatch from Surat, chemical-free ingredients, and deliveries.',
    url: 'https://labdhiherbs.com/faq',
  },
};

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Are Labdhi Herbs products 100% chemical-free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, all our formulations are crafted exclusively with pure botanical extracts, essential oils, and traditional herbs without parabens, mineral oils, or synthetic fragrances.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where are the products manufactured and dispatched from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every product is freshly formulated and dispatched directly from our dedicated workshop located in Surat, Gujarat.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does delivery take across India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Orders are packed and dispatched within 24 hours. Delivery typically takes 3–5 working days for metros and 5–7 working days for other locations across India.',
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <FaqClient />
    </>
  );
}
