"use client";

import { productTable, productVariantTable } from "@/db/schema";
import ProductItem from "./product-item";

interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
}

const ProductList = ({ title, products }: ProductListProps) => {
  return (
    <section>
      {/* 🔹 Título estilizado */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl m-auto mt-4 mb-4 font-semibold text-center text-blue-300">
          {title}
        </h3>
      </div>

      {/* 🔹 Lista horizontal */}
      <div
        className="
          flex gap-5 overflow-x-auto px-5 pb-4
          snap-x snap-mandatory scroll-smooth
          scrollbar-none
        "
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="
              snap-start shrink-0 w-[180px]
              bg-gradient-to-b from-neutral-900 to-neutral-950
              rounded-2xl overflow-hidden border border-white/10
              shadow-md hover:shadow-cyan-500/20
              transition-transform hover:-translate-y-2 duration-300
            "
          >
            <ProductItem product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductList;
