import { z } from "zod";

export const updateCartShippingAddressSchema = z.object({
  shippingAddressId: z.string().uuid(),
  shippingMethod: z.enum(["cold", "sedex", "pac"]),
  shippingPrice: z.number().min(0),
});

export type UpdateCartShippingAddressSchema = z.infer<
  typeof updateCartShippingAddressSchema
>;
