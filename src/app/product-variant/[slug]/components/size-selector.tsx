"use client";

import { useState } from "react";

type SizeSelectorProps = {
  sizes: {
    id: string;
    stock: number;
    size: {
      name: string;
    };
  }[];
};

export default function SizeSelector({ sizes }: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Tamanho</h3>

      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => {
          const outOfStock = s.stock <= 0;

          return (
            <button
              key={s.id}
              onClick={() => !outOfStock && setSelected(s.id)}
              className={`
                rounded-lg px-4 py-2 border text-sm transition-all
                ${selected === s.id ? "bg-blue-300 border-black" : "bg-[#111827] border-white/10"}
                ${outOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {s.size.name}
            </button>
          );
        })}
      </div>

      {/* usado pelo botão */}
      <input type="hidden" id="selected-size" value={selected ?? ""} />
    </div>
  );
}
