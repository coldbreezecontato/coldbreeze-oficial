import { useQuery } from "@tanstack/react-query";
import { calculateShipping } from "@/actions/shipping/calculate-shipping";

export function useShipping(city?: string, state?: string) {
  return useQuery({
    queryKey: ["shipping", city, state],
    queryFn: async () => {
      if (!city || !state) return null;
      return await calculateShipping({ city, state });
    },
    enabled: !!city && !!state,
  });
}
