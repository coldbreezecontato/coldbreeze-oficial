import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { Header } from "@/components/common/header";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";
import PaginatedCategoryGrid from "@/components/common/paginated-category-grid";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;

  const category = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
  });

  if (!category) return notFound();

  const products = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, category.id),
    with: {
      variants: true,
    },
  });

  return (
    <>
      <Header />

      <PaginatedCategoryGrid title={category.name} products={products} />
    </>
  );
};

export default CategoryPage;
