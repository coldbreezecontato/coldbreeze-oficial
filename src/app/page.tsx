import { desc } from "drizzle-orm";
import Image from "next/image";

import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable } from "@/db/schema";
import { BannerCarousel } from "@/components/common/banner-carousel";
import { BannerCarouselReverse } from "@/components/common/banner-carousel-reverse";
import ProductGrid from "@/components/common/product-grid";

const Home = async () => {
  const products = await db.query.productTable.findMany({
    with: {
      variants: true,
    },
  });
  const newlyCreatedProducts = await db.query.productTable.findMany({
    orderBy: [desc(productTable.createdAt)],
    with: {
      variants: true,
    },
  });
  const categories = await db.query.categoryTable.findMany({});

  return (
    <>
      <Header />
      <div className="h-5 w-full bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]"></div>
      <div className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] px-2">
        <BannerCarousel />
      </div>

      <div className="space-y-2">
        <ProductGrid products={newlyCreatedProducts} title="Novos produtos" />

        <div className="bg-transparent mt-5">
          <CategorySelector categories={categories} />
        </div>
      </div>

      <div className="mb-2 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]">
        <ProductList products={products} title="Mais vendidos" />
      </div>
      <div className="px-2">
        <BannerCarouselReverse />
      </div>
      <Footer />
    </>
  );
};

export default Home;
