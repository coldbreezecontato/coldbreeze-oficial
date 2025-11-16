import { useMutation, useQueryClient } from "@tanstack/react-query";

import { finishOrder } from "@/actions/finish-order";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getUseFinishOrderMutationKey = () => ["finish-order"];

export const useFinishOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: getUseFinishOrderMutationKey(),

    // 🔥 agora aceitando cupom!
    mutationFn: async (couponCode?: string) => {
      return await finishOrder(couponCode);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
