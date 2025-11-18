import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addProductToCart } from "@/actions/add-cart-product";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getIncreaseCartProductMutationKey = (
  productVariantId: string,
  productVariantSizeId: string
) =>
  [
    "increase-cart-product-quantity",
    productVariantId,
    productVariantSizeId,
  ] as const;

export const useIncreaseCartProduct = (
  productVariantId: string,
  productVariantSizeId: string
) => {
  const queryClient = useQueryClient();
  const cartQueryKey = getUseCartQueryKey();

  return useMutation({
    mutationKey: getIncreaseCartProductMutationKey(
      productVariantId,
      productVariantSizeId
    ),

    // ============================================================
    // 🔥 Optimistic Update — sem quebrar estrutura
    // ============================================================
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);

      // Atualização instantânea
      queryClient.setQueryData(cartQueryKey, (old: any) => {
        if (!old?.items) return old;

        return {
          ...old,
          items: old.items.map((item: any) =>
            item.productVariantId === productVariantId &&
            item.productVariantSizeId === productVariantSizeId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      });

      return { previousCart };
    },

    // ============================================================
    // 🚀 Mutation real
    // ============================================================
    mutationFn: async () => {
      const result = (await addProductToCart({
        productVariantId,
        productVariantSizeId,
        quantity: 1,
      })) as { ok?: boolean; error?: string };

      if (result.error === "OUT_OF_STOCK") {
        throw new Error("OUT_OF_STOCK");
      }

      return result;
    },

    // ============================================================
    // ❌ Se falhar → volta ao estado anterior
    // ============================================================
    onError: (error, _, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }

      toast.error(
        error instanceof Error && error.message === "OUT_OF_STOCK"
          ? "Estoque insuficiente! Você atingiu o limite disponível."
          : "Não foi possível adicionar o item ao carrinho."
      );
    },

    // ============================================================
    // ✅ Garante estado atualizado do server
    // ============================================================
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
};
