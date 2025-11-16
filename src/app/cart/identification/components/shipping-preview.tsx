"use client";

import { useShipping } from "@/hooks/queries/use-shipping";

export function ShippingPreview({
  city,
  state,
}: {
  city: string;
  state: string;
}) {
  const { data, isLoading } = useShipping(city, state);

  if (!city || !state) return null;

  if (isLoading)
    return (
      <p className="text-sm text-cyan-300 mt-2">Calculando frete...</p>
    );

  if (!data)
    return (
      <p className="text-sm text-red-400 mt-2">
        Não foi possível calcular o frete.
      </p>
    );

  return (
    <p className="text-sm text-green-400 mt-2">
      Frete: {(data?.price ?? 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })}
    </p>
  );
}
