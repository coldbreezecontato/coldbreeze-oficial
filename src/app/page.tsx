import { desc } from "drizzle-orm";
import Image from "next/image";


import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable } from "@/db/schema";
import { BannerCarousel } from "@/components/common/banner-carousel";

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
      <div className="mt-20"></div>
      <div className="px-2">
          <BannerCarousel />
        </div>
    
      <div className="space-y-2">

        <ProductList products={products} title="Mais vendidos" />

        <div className="px-1 bg-black">
          <CategorySelector categories={categories} />
        </div>
      </div>

      <div className="bg-black mb-2">
        <ProductList products={newlyCreatedProducts} title="Novos produtos" />
      </div>
      <div className="px-2">
          <BannerCarousel />
        </div>
       <Footer />
    </>
  );
};

export default Home;