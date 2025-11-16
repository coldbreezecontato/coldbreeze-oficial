"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema
) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const { orderId } = createCheckoutSessionSchema.parse(data);

  // 🧾 Pedido
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order) throw new Error("Order not found");
  if (order.userId !== session.user.id) throw new Error("Unauthorized");

  // 🧾 Itens do pedido com produto, variante e tamanho
  const items = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: {
        with: {
          product: true,
        },
      },
      productVariantSize: {
        with: {
          size: true,
        },
      },
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
  });

  // 💰 Subtotal baseado nos itens (sem desconto)
  const subtotalInCents = items.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0
  );

  // 🧮 Desconto aplicado no pedido (já calculado no finishOrder)
  const discountInCents = Math.max(
    0,
    subtotalInCents - order.totalPriceInCents
  );

  // 🎟️ Cupom do Stripe equivalente ao desconto aplicado
  let stripeCouponId: string | undefined;

  if (discountInCents > 0) {
    const stripeCoupon = await stripe.coupons.create({
      amount_off: discountInCents,
      currency: "brl",
      duration: "once",
    });

    stripeCouponId = stripeCoupon.id;
  }

  // 🧊 Line items com imagem, variante, tamanho e quantidade
  const line_items = items.map((item) => {
    const variant = item.productVariant;
    const product = variant?.product;
    const size = item.productVariantSize?.size;

    return {
      price_data: {
        currency: "brl",
        unit_amount: item.priceInCents, // preço unitário original (sem desconto)
        product_data: {
          name: `${product?.name ?? "Produto"} — ${variant?.name ?? "Variante"}`,
          description: `Tamanho: ${size?.name ?? "Único"}`,
          images:
            variant?.imageUrl && variant.imageUrl.length > 5
              ? [variant.imageUrl]
              : [],
        },
      },
      quantity: item.quantity,
    };
  });

  // 💳 Sessão do Stripe
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId,
    },
    line_items,
    // 🔥 aplica o desconto global para bater com order.totalPriceInCents
    discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : undefined,
  });

  return { id: checkoutSession.id };
};
