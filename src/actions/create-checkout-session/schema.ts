import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  orderId: z.string().uuid(),
  couponCode: z.string().optional(),
});

export type CreateCheckoutSessionSchema = z.infer<
  typeof createCheckoutSessionSchema
>;
