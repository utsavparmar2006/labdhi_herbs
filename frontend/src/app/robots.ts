import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/api/',
          '/api/*',
          '/checkout',
          '/order-success/*',
          '/profile',
          '/orders',
        ],
      },
    ],
    sitemap: 'https://labdhiherbs.com/sitemap.xml',
  };
}
