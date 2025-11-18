import { useMutation, useQueryClient } from "@tanstack/react-query";

import { decreaseCartProductQuantity } from "@/actions/decrease-cart-product-quantity";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getDecreaseCartProductMutationKey = (cartItemId: string) =>
  ["decrease-cart-product-quantity", cartItemId] as const;

export const useDecreaseCartProduct = (cartItemId: string) => {
  const queryClient = useQueryClient();
  const cartQueryKey = getUseCartQueryKey();

  return useMutation({
    mutationKey: getDecreaseCartProductMutationKey(cartItemId),

    // ============================================================
    // ⚡ Optimistic update — diminui quantidade na hora
    // ============================================================
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);

      queryClient.setQueryData(cartQueryKey, (old: any) => {
        if (!old?.items) return old;

        return {
          ...old,
          items: old.items
            .map((item: any) =>
              item.id === cartItemId
                ? {
                    ...item,
                    quantity: Math.max(item.quantity - 1, 0),
                  }
                : item
            )
            .filter((item: any) => item.quantity > 0), // remove se quantidade zerar
        };
      });

      return { previousCart };
    },

    // ============================================================
    // 🧨 Mutation real
    // ============================================================
    mutationFn: () => decreaseCartProductQuantity({ cartItemId }),

    // ============================================================
    // ❌ Rollback se der erro
    // ============================================================
    onError: (_, __, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
    },

    // ============================================================
    // 🔄 Revalidação para garantir estado real
    // ============================================================
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
};
