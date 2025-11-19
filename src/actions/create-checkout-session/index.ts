"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/db";
import { orderItemTable, orderTable, couponTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema
) => {
  // ====================================
  // 🔐 VALIDAÇÃO BÁSICA
  // ====================================
  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) throw new Error("Stripe secret key is missing");

  const userSession = await auth.api.getSession({
    headers: await headers(),
  });
  if (!userSession?.user) throw new Error("Unauthorized");

  const { orderId, couponCode } = createCheckoutSessionSchema.parse(data);

  // ====================================
  // 🧾 BUSCAR PEDIDO
  // ====================================
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });
  if (!order) throw new Error("Order not found");
  if (order.userId !== userSession.user.id) throw new Error("Unauthorized");

  // ====================================
  // 🛒 BUSCAR ITENS DO PEDIDO
  // ====================================
  const items = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: true,
    },
  });

  const firstProductImage =
    items[0]?.productVariant?.imageUrl ??
    `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // ====================================
  // 🎟️ CUPOM (CASO EXISTA)
  // ====================================
  const appliedCoupon = couponCode
    ? await db.query.couponTable.findFirst({
        where: eq(couponTable.code, couponCode),
      })
    : null;

  // ====================================
  // 💰 CÁLCULO DO SUBTOTAL E DESCONTO
  // ====================================
  const subtotalInCents = items.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0
  );

  const discountInCents = appliedCoupon
    ? appliedCoupon.discountType === "PERCENT"
      ? Math.round(
          (subtotalInCents * appliedCoupon.discountValue) / 100
        )
      : appliedCoupon.discountValue
    : 0;

  // ====================================
  // 💵 TOTAL FINAL (JÁ SALVO NO PEDIDO)
  // ====================================
  const totalFinalInCents = order.totalPriceInCents;

  // ====================================
  // 🧾 ITEM ÚNICO PARA O STRIPE
  // ====================================
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price_data: {
        currency: "brl",
        unit_amount: totalFinalInCents,
        product_data: {
          name: `Pedido Cold Breeze — ${totalItems} item${
            totalItems > 1 ? "s" : ""
          }`,
          description: "Resumo da compra",
          images: [firstProductImage],
        },
      },
      quantity: 1,
    },
  ];

  // ====================================
  // 💳 CRIAÇÃO DA SESSÃO DO STRIPE
  // ====================================
  const stripe = new Stripe(STRIPE_KEY, {
    apiVersion: "2024-06-20" as any,
  });

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    metadata: { orderId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
  });

  return { id: checkoutSession.id };
};
