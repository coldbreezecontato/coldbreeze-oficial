"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { productTable, productVariantTable } from "@/db/schema";
import ProductItem from "./product-item";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

interface PaginatedCategoryGridProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
  perPage?: number;
}

const PaginatedCategoryGrid = ({
  title,
  products,
  perPage = 8,
}: PaginatedCategoryGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentProducts = products.slice(startIndex, startIndex + perPage);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <section className="px-4 md:px-10 py-10 bg-gradient-to-b from-[#0a0f1f] via-[#0b1220] to-[#090d18]">
      {/* 🔹 Cabeçalho */}
      <div className="flex flex-col items-center mb-10">
        <h3 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 tracking-wide uppercase drop-shadow-[0_0_20px_rgba(0,255,255,0.15)]">
          {title}
        </h3>
        <div className="mt-3 h-[3px] w-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
      </div>

      {/* 🔹 Grid de produtos */}
      <div
        className="
          grid gap-8
          grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
          text-center justify-items-center
        "
      >
        {currentProducts.map((product) => (
          <div
            key={product.id}
            className="w-full max-w-[250px] transition-transform duration-300 hover:scale-[1.03]"
          >
            <ProductItem product={product} />
          </div>
        ))}
      </div>

      {/* 🔹 Paginação Cold Breeze */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-12">
          <Pagination>
            <PaginationContent className="flex gap-2 items-center">
              {/* Botão Anterior */}
              <PaginationItem>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`
                    flex items-center gap-2 rounded-md border border-cyan-500/40
                    px-3 py-2 mr-2 cursor-pointer text-sm font-semibold
                    text-cyan-300
                    shadow-[0_0_10px_rgba(0,255,255,0.25)]
                    hover:bg-cyan-500/10 hover:text-cyan-100
                    transition
                    ${
                      currentPage === 1
                        ? "opacity-40 pointer-events-none shadow-none"
                        : ""
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              </PaginationItem>

              {/* Páginas */}
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNumber = i + 1;
                const isActive = currentPage === pageNumber;
                return (
                  <PaginationItem key={pageNumber}>
                    <button
                      onClick={() => goToPage(pageNumber)}
                      className={`
                        px-3 py-2 rounded-md text-sm font-semibold transition
                        ${
                          isActive
                            ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                            : "text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-100"
                        }
                      `}
                    >
                      {pageNumber}
                    </button>
                  </PaginationItem>
                );
              })}

              {/* Botão Próximo */}
              <PaginationItem>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`
                    flex items-center gap-2 rounded-md border border-cyan-500/40
                    px-3 py-2 ml-2 cursor-pointer text-sm font-semibold
                    text-cyan-300
                    shadow-[0_0_10px_rgba(0,255,255,0.25)]
                    hover:bg-cyan-500/10 hover:text-cyan-100
                    transition
                    ${
                      currentPage === totalPages
                        ? "opacity-40 pointer-events-none shadow-none"
                        : ""
                    }
                  `}
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );
};

export default PaginatedCategoryGrid;
