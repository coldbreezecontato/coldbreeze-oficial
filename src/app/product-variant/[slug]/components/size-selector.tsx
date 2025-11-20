"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
                relative flex items-center gap-2 rounded-lg px-4 py-2 border text-sm transition-all
                ${selected === s.id
                  ? "bg-blue-300 border-black text-black"
                  : "bg-[#111827] border-white/10 text-white"
                }
                ${outOfStock
                  ? "opacity-40 cursor-not-allowed"
                  : "cursor-pointer hover:border-blue-400"
                }
              `}
            >
              {/* Nome do tamanho */}
              <span>{s.size.name}</span>

              {/* Estoque */}
              <span className="text-xs opacity-80">
                ({s.stock})
              </span>

              {/* X quando estiver sem estoque */}
              {outOfStock && (
                <X
                  size={14}
                  className="text-red-500 absolute w-full left-0 h-10"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* usado pelo botão */}
      <input type="hidden" id="selected-size" value={selected ?? ""} />
    </div>
  );
}
