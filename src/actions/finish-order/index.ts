"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  orderItemTable,
  orderTable,
  couponTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export const finishOrder = async (couponCode?: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // 🛒 Carrega carrinho completo
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, session.user.id),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: true,
          productVariantSize: { with: { size: true } },
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!cart.shippingAddress) {
    throw new Error("Shipping address not found");
  }

  // ✅ Agora o TS entende que nunca é null
  const shippingAddress = cart.shippingAddress;

  // Subtotal sem cupom
  let totalPriceInCents = cart.items.reduce(
    (acc, item) =>
      acc + item.productVariant.priceInCents * item.quantity,
    0
  );

  // 🎫 Aplicar cupom no backend
  if (couponCode) {
    const coupon = await db.query.couponTable.findFirst({
      where: eq(couponTable.code, couponCode),
    });

    if (coupon && coupon.isActive && coupon.expiresAt > new Date()) {
      if (coupon.discountType === "PERCENT") {
        totalPriceInCents = Math.round(
          totalPriceInCents * (1 - coupon.discountValue / 100)
        );
      } else if (coupon.discountType === "FIXED") {
        totalPriceInCents = Math.max(
          0,
          totalPriceInCents - coupon.discountValue
        );
      }
    }
  }

  let orderId: string | undefined;

  // 🧾 Criar o pedido
  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orderTable)
      .values({
        email: shippingAddress.email,
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
        cpfOrCnpj: shippingAddress.cpfOrCnpj,
        city: shippingAddress.city,
        complement: shippingAddress.complement ?? null,
        neighborhood: shippingAddress.neighborhood,
        number: shippingAddress.number,
        recipientName: shippingAddress.recipientName,
        state: shippingAddress.state,
        street: shippingAddress.street,
        userId: session.user.id,
        totalPriceInCents, // 🔥 já com desconto aplicado
        shippingAddressId: shippingAddress.id,
      })
      .returning();

    if (!order) {
      throw new Error("Failed to create order");
    }

    orderId = order.id;

    const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> =
      cart.items.map((item) => ({
        orderId: order.id,
        productVariantId: item.productVariant.id,
        productVariantSizeId: item.productVariantSizeId,
        quantity: item.quantity,
        priceInCents: item.productVariant.priceInCents,
      }));

    await tx.insert(orderItemTable).values(orderItemsPayload);

    // 🧹 limpa carrinho
    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
  });

  if (!orderId) {
    throw new Error("Failed to create order");
  }

  return { orderId };
};
