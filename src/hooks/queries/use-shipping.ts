// hooks/queries/use-shipping.ts
"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchShipping(city: string, state: string) {
  const res = await fetch(`/api/shipping?city=${city}&state=${state}`);
  if (!res.ok) return null;
  return res.json();
}

export function useShipping(city: string, state: string) {
  return useQuery({
    queryKey: ["shipping", city, state],
    queryFn: () => fetchShipping(city, state),
    enabled: !!city && !!state,
  });
}
