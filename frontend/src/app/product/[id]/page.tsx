import type { Metadata } from 'next';
import ProductClient from './ProductClient';
import { PRODUCTS, getProductByIdOrSlug } from '../../../services/mockData';

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: String(product.id),
  }));
}

interface ProductPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductByIdOrSlug(params.id);

  return {
    title: `${product.name} — Pure Ayurvedic ${product.category}`,
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

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductByIdOrSlug(params.id);

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
      ratingValue: product.rating,
      reviewCount: product.reviewsCount,
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
