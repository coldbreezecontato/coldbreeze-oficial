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

  return useMutation({
    mutationKey: getIncreaseCartProductMutationKey(
      productVariantId,
      productVariantSizeId
    ),

    mutationFn: async () => {
      const result = (await addProductToCart({
        productVariantId,
        productVariantSizeId,
        quantity: 1,
      })) as { ok?: boolean; error?: string };

      // 🔥 Tratamento do estoque insuficiente
      if (result.error === "OUT_OF_STOCK") {
        throw new Error("OUT_OF_STOCK");
      }

      return result;
    },

    onError: (error) => {
      if (error instanceof Error && error.message === "OUT_OF_STOCK") {
        toast.error("Estoque insuficiente! Você atingiu o limite disponível.");
        return;
      }

      toast.error("Erro ao atualizar o carrinho.");
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey(),
      });
    },
  });
};
