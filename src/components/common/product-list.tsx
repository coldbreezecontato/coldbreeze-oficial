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
    <section className="space-y-6">
      {/* 🔹 Título estilizado */}
      <div className="flex items-center justify-between px-5">
        <h3 className="text-xl font-semibold tracking-tight text-white/90">
          {title}
        </h3>
        <span className="text-sm text-white/50 hover:text-cyan-400 cursor-pointer transition">
          Ver todos →
        </span>
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
