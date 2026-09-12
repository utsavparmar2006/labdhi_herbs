import { MAIN_CATEGORIES } from '../../../services/mockData';
import { getCategories } from '../../../services/api';
import CategoryPageClient from './CategoryPageClient';
import { notFound } from 'next/navigation';

interface Props {
  params: { category: string };
}

const CATEGORY_ALIASES: Record<string, string> = {
  'muscle-care': 'muscle-joint-care',
  'joint-care': 'muscle-joint-care',
  'skin-care': 'skin-face-care',
  'face-care': 'skin-face-care',
};

export function generateStaticParams() {
  const ids = new Set<string>();
  MAIN_CATEGORIES.filter((mc) => mc.id !== 'all').forEach((mc) => ids.add(mc.id));
  Object.keys(CATEGORY_ALIASES).forEach((alias) => ids.add(alias));
  return Array.from(ids).map((category) => ({
    category,
  }));
}

export default async function CategoryPage({ params }: Props) {
  const targetId = CATEGORY_ALIASES[params.category] || params.category;
  let mainCat = MAIN_CATEGORIES.find((mc) => mc.id === targetId || mc.id === params.category);

  if (!mainCat) {
    try {
      const allCats = await getCategories();
      mainCat = allCats.find(
        (mc) =>
          mc.id === targetId ||
          mc.slug === targetId ||
          mc.id === params.category ||
          mc.slug === params.category
      );
    } catch (e) {
      // ignore
    }
  }

  if (!mainCat) return notFound();

  return <CategoryPageClient mainCategory={mainCat} />;
}

