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

export const finishOrder = async ({
  couponCode,
  subtotalInCents,
  shippingInCents,
  discountInCents,
  totalPriceInCents,
}: {
  couponCode?: string;
  subtotalInCents: number;
  shippingInCents: number;
  discountInCents: number;
  totalPriceInCents: number;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  /* ============================================================
     🛡️ 1. Proteção anti duplicação de pedido
  ============================================================ */
  const existingOrder = await db.query.orderTable.findFirst({
    where: eq(orderTable.userId, session.user.id),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  if (existingOrder) {
    const diff = Date.now() - new Date(existingOrder.createdAt).getTime();
    if (diff < 5000) {
      return { orderId: existingOrder.id };
    }
  }

  /* ============================================================
     🛒 2. Carrega carrinho
  ============================================================ */
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
    if (existingOrder) return { orderId: existingOrder.id };
    throw new Error("Cart not found");
  }

  if (!cart.shippingAddress) {
    if (existingOrder) return { orderId: existingOrder.id };
    throw new Error("Shipping address not found");
  }

  const shippingAddress = cart.shippingAddress;

  /* ============================================================
     🎟️ 3. Valida cupom
  ============================================================ */
  let couponId: string | null = null;

  if (couponCode) {
    const coupon = await db.query.couponTable.findFirst({
      where: eq(couponTable.code, couponCode),
    });

    if (coupon && coupon.isActive && coupon.expiresAt > new Date()) {
      couponId = coupon.id;
    }
  }

  let orderId: string | undefined;

  /* ============================================================
     🧾 4. Criar pedido (TRANSAÇÃO)
  ============================================================ */
  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orderTable)
      .values({
        // =======================
        // 📦 Dados do cliente/entrega
        // =======================
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

        // =======================
        // 🚚 ENTREGA
        // =======================
        shippingMethod: cart.shippingMethod,       // 🔥 AGORA SALVA CORRETAMENTE
        shippingInCents: shippingInCents,

        // =======================
        // 💰 FINANCEIRO
        // =======================
        subtotalInCents,
        discountInCents,
        totalPriceInCents,

        // =======================
        // IDs
        // =======================
        shippingAddressId: shippingAddress.id,
        couponId,
      })
      .returning();

    if (!order) throw new Error("Failed to create order");

    orderId = order.id;

    // =======================
    // 📦 Itens do pedido
    // =======================
    const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> =
      cart.items.map((item) => ({
        orderId: order.id,
        productVariantId: item.productVariant.id,
        productVariantSizeId: item.productVariantSizeId,
        quantity: item.quantity,
        priceInCents: item.productVariant.priceInCents,
      }));

    await tx.insert(orderItemTable).values(orderItemsPayload);

    // =======================
    // 🧹 Limpa carrinho
    // =======================
    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
  });

  if (!orderId) throw new Error("Failed to create order");

  return { orderId };
};
