"use client";

import Image from "next/image";
import Link from "next/link";

import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";

interface ProductItemProps {
  product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  };
  textContainerClassName?: string;
}

const ProductItem = ({ product, textContainerClassName }: ProductItemProps) => {
  const firstVariant = product.variants[0];

  return (
    <Link
      href={`/product-variant/${firstVariant.slug}`}
      className="
        group flex flex-col gap-3
        w-[240px] shrink-0
        rounded-2xl overflow-hidden
        bg-gradient-to-b from-neutral-900 to-neutral-950
        shadow-md hover:shadow-cyan-500/20
        transition-all duration-300
      "
    >
      {/* 🧊 Imagem do produto */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={firstVariant.imageUrl}
          alt={firstVariant.name}
          fill
          sizes="(max-width: 768px) 100vw, 180px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Glow discreto */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-cyan-400 blur-2xl transition-opacity" />
      </div>

      {/* 🏷️ Informações */}
      <div
        className={cn(
          "flex flex-col px-3 pb-4 text-center space-y-1",
          textContainerClassName,
        )}
      >
        <p className="truncate text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
          {product.name}
        </p>
        <p className="text-xs text-white/50 truncate">{product.description ?? "Cold Breeze"}</p>
        <p className="text-sm font-bold text-blue-300">
          {formatCentsToBRL(firstVariant.priceInCents)}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
