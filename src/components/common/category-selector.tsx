"use client";

import Link from "next/link";
import { categoryTable } from "@/db/schema";
import { Button } from "../ui/button";

interface CategorySelectorProps {
  categories: (typeof categoryTable.$inferSelect)[];
}

const CategorySelector = ({ categories }: CategorySelectorProps) => {
  return (
    <section
      className="
        w-full max-w-5xl mx-auto px-6 py-10
        bg-gradient-to-b from-[#0a0f1f]/50 to-[#090d18]/70
        rounded-3xl shadow-[0_0_25px_rgba(0,0,0,0.3)]
        backdrop-blur-md border border-white/10
      "
    >
      {/* 🔹 Cabeçalho */}
      <div className="flex items-center justify-center mb-8">
        <h2
          className="
            text-lg md:text-xl font-extrabold uppercase
            text-transparent bg-clip-text
            bg-gradient-to-r from-cyan-300 to-blue-400
            tracking-wide text-center
          "
        >
          Categorias
        </h2>
      </div>

      {/* 🔹 Grade de Categorias */}
      <div
        className="
          grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
          gap-3 md:gap-4
        "
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            asChild
            variant="ghost"
            className="
              w-full h-10 md:h-11
              rounded-full border border-white/10
              bg-white/10 text-xs md:text-sm font-semibold text-white
              hover:bg-cyan-400 hover:text-black
              transition-all duration-300 ease-out
              shadow-[0_0_10px_rgba(0,255,255,0.1)]
              hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]
            "
          >
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
          </Button>
        ))}
      </div>
    </section>
  );
};

export default CategorySelector;
