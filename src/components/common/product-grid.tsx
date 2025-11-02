"use client";

import { productTable, productVariantTable } from "@/db/schema";
import ProductItem from "./product-item";

interface ProductGridProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
}

const ProductGrid = ({ title, products }: ProductGridProps) => {
  return (
    <section className="px-4 md:px-10 py-10 bg-gradient-to-b from-[#0a0f1f] via-[#0b1220] to-[#090d18]">
      {/* 🔹 Cabeçalho */}
      <div className="flex flex-col items-center mb-10">
        <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 tracking-wide uppercase drop-shadow-[0_0_20px_rgba(0,255,255,0.15)]">
          {title}
        </h3>
        <div className="mt-3 h-[3px] w-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]"></div>
      </div>

      {/* 🔹 Grid responsivo */}
      <div
        className="
          grid gap-8
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
          text-center justify-items-center
        "
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="
              w-full max-w-[250px] transition-transform duration-300
              hover:scale-[1.03]
            "
          >
            <ProductItem product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductGrid;
