import ProductPage, { generateMetadata as baseGenerateMetadata, generateStaticParams as baseGenerateStaticParams } from '../../product/[id]/page';

export const generateStaticParams = baseGenerateStaticParams;

interface ProductsPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProductsPageProps) {
  return baseGenerateMetadata({ params });
}

export default function ProductsAliasPage({ params }: ProductsPageProps) {
  return <ProductPage params={params} />;
}
