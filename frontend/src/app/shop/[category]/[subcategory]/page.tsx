import { MAIN_CATEGORIES } from '../../../../services/mockData';
import SubCategoryProductsClient from './SubCategoryProductsClient';
import { notFound } from 'next/navigation';

interface Props {
  params: {
    category: string;
    subcategory: string;
  };
}

export function generateStaticParams() {
  const paths: { category: string; subcategory: string }[] = [];
  MAIN_CATEGORIES.forEach((mc) => {
    if (mc.id === 'all') return;
    mc.subCategories.forEach((sc) => {
      if (sc.id === 'all-sub' || sc.slug === 'All') return;
      paths.push({
        category: mc.id,
        subcategory: sc.id,
      });
    });
  });
  return paths;
}

export default function SubCategoryProductsPage({ params }: Props) {
  const mainCategory = MAIN_CATEGORIES.find((mc) => mc.id === params.category);
  if (!mainCategory) return notFound();

  const subCategory = mainCategory.subCategories.find((sc) => sc.id === params.subcategory);
  if (!subCategory) return notFound();

  return (
    <SubCategoryProductsClient
      mainCategory={mainCategory}
      subCategory={subCategory}
    />
  );
}
