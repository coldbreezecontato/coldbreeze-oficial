import { useMutation, useQueryClient } from "@tanstack/react-query";

import { finishOrder } from "@/actions/finish-order";

import { getUseCartQueryKey } from "../queries/use-cart";

export const getUseFinishOrderMutationKey = () => ["finish-order"];

export const useFinishOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getUseFinishOrderMutationKey(),

    // Agora a mutation recebe o objeto correto
    mutationFn: async (data: {
      couponCode?: string;
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
