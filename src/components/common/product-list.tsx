"use client";

import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
    <section
      className="
        w-full px-4 sm:px-6 md:px-10 xl:px-20
        py-10 md:py-16
        bg-gradient-to-b from-[#0a0f1f] via-[#0b1220] to-[#090d18]
        rounded-t-3xl
      "
    >
      {/* 🔹 Cabeçalho estilizado */}
      <div className="flex flex-col items-center text-center mb-10 md:mb-14">
        <h3
          className="
            text-2xl sm:text-3xl md:text-4xl font-extrabold
            text-transparent bg-clip-text
            bg-gradient-to-r from-cyan-300 to-blue-400
            tracking-wide uppercase
            drop-shadow-[0_0_10px_rgba(0,255,255,0.2)]
          "
        >
          {title}
        </h3>
        <div className="mt-3 h-[3px] w-24 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" />
      </div>

      {/* 🔹 Carousel de produtos */}
      <div className="relative">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3500,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem
                key={product.id}
                className="
                  basis-[75%] sm:basis-[50%] md:basis-[33%] lg:basis-[25%]
                  flex justify-center
                "
              >
                <ProductItem product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* 🔹 Botões de navegação */}
          <CarouselPrevious
            className="
              absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2
              bg-neutral-900/80 border border-white/10 hover:bg-cyan-900/60
              backdrop-blur-sm
            "
          />
          <CarouselNext
            className="
              absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2
              bg-neutral-900/80 border border-white/10 hover:bg-cyan-900/60
              backdrop-blur-sm
            "
          />
        </Carousel>
      </div>
    </section>
  );
};

export default ProductList;
