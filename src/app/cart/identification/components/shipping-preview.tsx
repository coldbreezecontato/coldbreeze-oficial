"use client";

import { useState } from "react";
import { useShipping } from "@/hooks/queries/use-shipping";
import { useUpdateCartShippingAddress } from "@/hooks/mutations/use-update-cart-shipping-address";

export function ShippingPreview({
  addressId,
  city,
  state,
  onSelect,
}: {
  addressId: string;
  city: string;
  state: string;
  onSelect: (method: "cold" | "sedex" | "pac", price: number) => void;
}) {
  const { data, isLoading } = useShipping(city, state);
  const [selected, setSelected] = useState<"cold" | "sedex" | "pac" | null>(null);

  const updateCartShipping = useUpdateCartShippingAddress();

  if (isLoading)
    return <p className="text-sm text-cyan-300 mt-2">Calculando frete...</p>;

  if (!data)
    return <p className="text-sm text-red-400 mt-2">Não foi possível calcular o frete.</p>;

  const methods = [
    { id: "cold", ...data.cold },
    { id: "sedex", ...data.sedex },
    { id: "pac", ...data.pac },
  ];

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium text-white">Escolha o método de entrega:</p>

      {methods.map((m) => (
        <label
          key={m.id}
          className={`flex justify-between items-center px-4 py-2 rounded-md cursor-pointer border
            ${selected === m.id ? "border-cyan-400 bg-cyan-950/20" : "border-white/10"}
          `}
        >
          <input
            type="radio"
            name="shippingMethod"
            checked={selected === m.id}
            onChange={async () => {
              setSelected(m.id);

              // Atualiza no carrinho imediatamente
              await updateCartShipping.mutateAsync({
                shippingAddressId: addressId,
                shippingMethod: m.id,
                shippingPrice: m.price,
              });

              // Atualiza o parent (Addresses)
              onSelect(m.id, m.price);
            }}
          />

          <div className="flex-1">
            <p className="text-white text-sm">{m.name}</p>
            <p className="text-xs text-gray-300">{m.deadline}</p>
          </div>

          <p className="text-green-400 text-sm">
            {m.price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </label>
      ))}
    </div>
  );
}
