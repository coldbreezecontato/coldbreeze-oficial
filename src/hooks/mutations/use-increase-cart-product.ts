import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addProductToCart } from "@/actions/add-cart-product";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getIncreaseCartProductMutationKey = (
  productVariantId: string,
  productVariantSizeId: string
) => ["increase-cart-product-quantity", productVariantId, productVariantSizeId] as const;

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

    mutationFn: () =>
      addProductToCart({
        productVariantId,
        productVariantSizeId, // <-- ENVIA O TAMANHO AQUI
        quantity: 1,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUseCartQueryKey(),
      });
    },
  });
};
