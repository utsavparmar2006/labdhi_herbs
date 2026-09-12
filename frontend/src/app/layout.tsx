import type { Metadata } from 'next';
import Providers from '../components/Providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://labdhiherbs.com'),
  title: {
    default: 'Labdhi Herbs — Pure Ayurvedic & Herbal Wellness Formulations | Surat, Gujarat',
    template: '%s | Labdhi Herbs',
  },
  description:
    'Discover 100% pure Ayurvedic formulations, herbal hair oils, muscle care balms, and natural skin care products from Labdhi Herbs, Surat, Gujarat. Chemical-free, time-tested herbal wellness.',
  keywords: [
    'Labdhi Herbs',
    'Ayurvedic formulations',
    'herbal hair oil',
    'muscle care balm',
    'natural skin care',
    'Surat Gujarat herbal products',
    'chemical free Ayurvedic care',
    'herbal wellness India',
  ],
  authors: [{ name: 'Labdhi Herbs', url: 'https://labdhiherbs.com' }],
  creator: 'Labdhi Herbs',
  publisher: 'Labdhi Herbs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://labdhiherbs.com',
  },
  openGraph: {
    title: 'Labdhi Herbs — Pure Ayurvedic & Herbal Wellness Formulations',
    description:
      'Handcrafted 100% pure Ayurvedic herbal formulations for hair care, skin care, muscle care, and joint care directly from Surat, Gujarat.',
    url: 'https://labdhiherbs.com',
    siteName: 'Labdhi Herbs',
    images: [
      {
        url: 'https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg',
        width: 1200,
        height: 630,
        alt: 'Labdhi Herbs Logo',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Labdhi Herbs — Pure Ayurvedic & Herbal Wellness Formulations',
    description:
      '100% pure Ayurvedic herbal hair oil, muscle care, and natural skin care products from Surat, Gujarat.',
    images: ['https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Labdhi Herbs',
  url: 'https://labdhiherbs.com',
  logo: 'https://labdhiherbs.com/uploads/logo/Main-logo-531.jpg',
  description:
    'Manufacturer and seller of pure Ayurvedic herbal formulations for hair care, skin care, muscle care, and joint health.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Adajan',
    addressLocality: 'Surat',
    addressRegion: 'Gujarat',
    postalCode: '395009',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9328349328',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi', 'gu'],
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Labdhi Herbs',
  url: 'https://labdhiherbs.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://labdhiherbs.com/shop?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="antialiased bg-[#F8F6F0] text-[#1A201C] selection:bg-[#1F3A2E] selection:text-[#EFE9DD]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
