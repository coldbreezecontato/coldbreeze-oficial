"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartShippingAddress } from "@/actions/update-cart-shipping-address";
import { getUseCartQueryKey } from "../queries/use-cart";

// Tipagem com os valores PERMITIDOS pelo schema Zod
type ShippingMethod = "cold" | "sedex" | "pac";

export const useUpdateCartShippingAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shippingAddressId: string;
      shippingMethod: ShippingMethod;
      shippingPrice: number;
    }) => {
      return await updateCartShippingAddress(data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },

    onError: (err) => {
      console.error("Erro ao atualizar método de entrega:", err);
    },
  });
};
