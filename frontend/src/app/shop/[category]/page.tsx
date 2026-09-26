import { getCategories } from '../../../services/api';
import CategoryPageClient from './CategoryPageClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: { category: string };
}

export function generateStaticParams() {
  return [];
}

export default async function CategoryPage({ params }: Props) {
  let mainCat = null;

  try {
    const allCats = await getCategories();
    if (allCats && Array.isArray(allCats)) {
      mainCat = allCats.find(
        (mc) =>
          mc.id === params.category ||
          mc.slug?.toLowerCase() === params.category.toLowerCase() ||
          mc.name?.toLowerCase() === params.category.toLowerCase()
      );
    }
  } catch (e) {
    // ignore
  }

  if (!mainCat) return notFound();

  return <CategoryPageClient mainCategory={mainCat} />;
}
