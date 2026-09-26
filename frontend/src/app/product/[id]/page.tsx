import type { Metadata } from 'next';
import ProductClient from './ProductClient';
import { getProductById } from '../../../services/api';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const res = await getProductById(params.id);
  const product = res.data;

  if (!product) {
    return {
      title: 'Product Not Found | Labdhi Herbs',
    };
  }

  return {
    title: `${product.name} — Pure Ayurvedic ${product.category || 'Formulation'}`,
    description: product.description,
    alternates: {
      canonical: `https://labdhiherbs.com/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | Labdhi Herbs`,
      description: product.description,
      url: `https://labdhiherbs.com/product/${product.id}`,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const res = await getProductById(params.id);
  const product = res.data;

  if (!product) {
    return notFound();
  }

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Labdhi Herbs',
    },
    offers: {
      '@type': 'Offer',
      url: `https://labdhiherbs.com/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Labdhi Herbs',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 5,
      reviewCount: product.reviewsCount || 1,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <ProductClient productId={params.id} />
    </>
  );
}
