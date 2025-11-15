import { z } from "zod";

export const addProductToCartSchema = z.object({
  productVariantId: z.string().uuid(),
  productVariantSizeId: z.string().uuid(),
  quantity: z.number().min(1),
});

export type AddProductToCartSchema = z.infer<typeof addProductToCartSchema>;
