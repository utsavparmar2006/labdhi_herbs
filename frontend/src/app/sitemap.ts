import { MetadataRoute } from 'next';

export const revalidate = 3600; // Auto-regenerate sitemap every hour for fresh indexation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://labdhiherbs.com';
  const apiBase =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:5000/api';

  // 1. Core Public Commercial & Legal Routes with SEO Weights
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/success-stories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/stories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Dynamic Categories & Nested Subcategories Discovery
  const categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const catRes = await fetch(`${apiBase}/v1/categories`, {
      next: { revalidate: 3600 },
    });

    if (catRes.ok) {
      const catData = await catRes.json();
      const categories = Array.isArray(catData) ? catData : catData?.data || [];

      for (const cat of categories) {
        if (!cat || cat.status === 'inactive') continue;
        const catSlug = cat.id || cat.slug;
        if (!catSlug) continue;

        // Main Category Route (e.g., /shop/hair-care)
        categoryRoutes.push({
          url: `${baseUrl}/shop/${encodeURIComponent(catSlug)}`,
          lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.85,
        });

        // Nested Subcategories (e.g., /shop/hair-care/hair-oils)
        if (Array.isArray(cat.subCategories)) {
          for (const sub of cat.subCategories) {
            const subSlug = sub.id || sub.slug;
            if (!subSlug) continue;

            categoryRoutes.push({
              url: `${baseUrl}/shop/${encodeURIComponent(catSlug)}/${encodeURIComponent(subSlug)}`,
              lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Dynamic category discovery notice:', err);
  }

  // 3. Dynamic Products Discovery (Full catalog indexation)
  const productRoutes: MetadataRoute.Sitemap = [];
  try {
    const prodRes = await fetch(`${apiBase}/v1/products?limit=500`, {
      next: { revalidate: 3600 },
    });

    if (prodRes.ok) {
      const prodData = await prodRes.json();
      const products = Array.isArray(prodData) ? prodData : prodData?.data || [];

      for (const p of products) {
        if (!p || p.inStock === false) continue;
        const productId = p.id || p._id;
        if (!productId) continue;

        productRoutes.push({
          url: `${baseUrl}/product/${encodeURIComponent(productId)}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'daily',
          priority: 0.9,
        });
      }
    }
  } catch (err) {
    console.warn('[Sitemap] Dynamic product discovery notice:', err);
  }

  // Deduplicate URLs to avoid search engine index penalties
  const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];
  const seenUrls = new Set<string>();
  const uniqueRoutes: MetadataRoute.Sitemap = [];

  for (const route of allRoutes) {
    if (!seenUrls.has(route.url)) {
      seenUrls.add(route.url);
      uniqueRoutes.push(route);
    }
  }

  return uniqueRoutes;
}
