"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable, shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  UpdateCartShippingAddressSchema,
  updateCartShippingAddressSchema,
} from "./schema";

export const updateCartShippingAddress = async (
  data: UpdateCartShippingAddressSchema,
) => {
  // ZOD VALIDATION
  updateCartShippingAddressSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const shippingAddress = await db.query.shippingAddressTable.findFirst({
    where: (sa, { eq, and }) =>
      and(
        eq(sa.id, data.shippingAddressId),
        eq(sa.userId, session.user.id),
      ),
  });

  if (!shippingAddress) throw new Error("Shipping address not found");

  const cart = await db.query.cartTable.findFirst({
    where: (c, { eq }) => eq(c.userId, session.user.id),
  });

  if (!cart) throw new Error("Cart not found");

  await db
    .update(cartTable)
    .set({
      shippingAddressId: data.shippingAddressId,
      shippingMethod: data.shippingMethod,
      shippingPriceInCents: Math.round(data.shippingPrice * 100),
    })
    .where(eq(cartTable.id, cart.id));

  return { success: true };
};
