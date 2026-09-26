import { Product, Category, MainCategory, BlogPost, Testimonial } from '../types';

/**
 * Dynamic Categories & Products
 * Initialized as empty so the site displays ONLY real data from Admin Panel / MongoDB.
 */
export const MAIN_CATEGORIES: MainCategory[] = [];

export const CATEGORIES: Category[] = [];

export const PRODUCTS: Product[] = [];

export const BLOG_POSTS: BlogPost[] = [];

export const TESTIMONIALS: Testimonial[] = [];

export function getProductByIdOrSlug(idOrSlug: string): Product | null {
  if (!idOrSlug) return null;
  const match = PRODUCTS.find((p) => p.id.toLowerCase() === idOrSlug.toLowerCase());
  if (match) return match;
  return null;
}
