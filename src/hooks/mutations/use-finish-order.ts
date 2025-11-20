import { useMutation, useQueryClient } from "@tanstack/react-query";

import { finishOrder } from "@/actions/finish-order";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getUseFinishOrderMutationKey = () => ["finish-order"];

export const useFinishOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getUseFinishOrderMutationKey(),

    // Agora a mutation recebe TODOS os campos necessários
    mutationFn: async (data: {
      couponCode?: string;
      subtotalInCents: number;
      shippingInCents: number;
      discountInCents: number;
      totalPriceInCents: number;
    }) => {
      return await finishOrder(data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey(),
      });
    },
  });
};
