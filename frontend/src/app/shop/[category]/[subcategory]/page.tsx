import { getCategories } from '../../../../services/api';
import SubCategoryProductsClient from './SubCategoryProductsClient';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    category: string;
    subcategory: string;
  };
}

export function generateStaticParams() {
  return [];
}

export default async function SubCategoryProductsPage({ params }: Props) {
  let mainCategory = null;
  let subCategory = null;

  try {
    const allCats = await getCategories();
    if (allCats && Array.isArray(allCats)) {
      mainCategory = allCats.find(
        (mc) =>
          mc.id === params.category ||
          mc.slug?.toLowerCase() === params.category.toLowerCase() ||
          mc.name?.toLowerCase() === params.category.toLowerCase()
      );
      if (mainCategory && Array.isArray(mainCategory.subCategories)) {
        subCategory = mainCategory.subCategories.find(
          (sc) =>
            sc.id === params.subcategory ||
            sc.slug?.toLowerCase() === params.subcategory.toLowerCase() ||
            sc.name?.toLowerCase() === params.subcategory.toLowerCase()
        );
      }
    }
  } catch (e) {
    // ignore
  }

  if (!mainCategory || !subCategory) return notFound();

  return (
    <SubCategoryProductsClient
      mainCategory={mainCategory}
      subCategory={subCategory}
    />
  );
}
