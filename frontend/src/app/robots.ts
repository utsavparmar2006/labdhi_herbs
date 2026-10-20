import { MetadataRoute } from 'next';

export const revalidate = 86400; // Cache for 24 hours, automatically regenerates

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://labdhiherbs.com'
  ).replace(/\/+$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/shop',
          '/shop/*',
          '/products',
          '/products/*',
          '/product/*',
          '/blog',
          '/gallery',
          '/stories',
          '/success-stories',
          '/about',
          '/about-us',
          '/faq',
          '/shipping',
          '/refund',
          '/terms',
          '/privacy',
          '/track-order',
          '/uploads/*',
          '/_next/static/*',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/checkout',
          '/checkout/*',
          '/order-success',
          '/order-success/*',
          '/profile',
          '/profile/*',
          '/orders',
          '/orders/*',
          '/*?*search=*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/',
          '/uploads/*',
          '/images/*',
          '/_next/static/media/*',
        ],
        disallow: [
          '/admin/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/shop/*',
          '/product/*',
          '/products/*',
          '/blog',
          '/uploads/*',
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/checkout',
          '/profile/*',
          '/orders/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
