"use server";

import { DistanceService } from "@/lib/shipping/distance-service";

export async function calculateShipping({ city, state }: { city: string; state: string }) {
  if (!city || !state) {
    return { error: "city e state são obrigatórios" };
  }

  const price = await DistanceService.calculate(city, state);

  return {
    city,
    state,
    price,
    message: `Frete para ${city}/${state}: R$${price.toFixed(2)}`
  };
}
