"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/db";
import { couponTable, orderItemTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema,
) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set");
  }

  // 🔐 Autenticação do usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // ✅ Validação do schema
  const { orderId, couponCode } = createCheckoutSessionSchema.parse(data);

  // 🔎 Busca o pedido
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order) throw new Error("Order not found");
  if (order.userId !== session.user.id) throw new Error("Unauthorized");

  // 🧾 Itens do pedido com produto e variante
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
    },
  });

  // ⚙️ Inicializa Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 🏷️ Busca e aplica cupom (caso exista)
  let activeCoupon: typeof couponTable.$inferSelect | null = null;

  if (couponCode) {
    const coupon = await db.query.couponTable.findFirst({
      where: eq(couponTable.code, couponCode),
    });

    if (coupon && coupon.isActive && coupon.expiresAt > new Date()) {
      activeCoupon = coupon;
    }
  }

  // 💳 Cria sessão de pagamento com produtos reais
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId,
      couponCode: couponCode || "",
    },
    line_items: orderItems.map((item, index) => {
      // 🔹 Calcula o preço do item com desconto proporcional
      let priceInCents = item.priceInCents;

      if (activeCoupon) {
        if (activeCoupon.discountType === "PERCENT") {
          priceInCents = Math.round(
            item.priceInCents * (1 - activeCoupon.discountValue / 100),
          );
        } else if (activeCoupon.discountType === "FIXED") {
          // Aplica desconto fixo apenas ao primeiro item
          if (index === 0) {
            priceInCents = Math.max(
              0,
              item.priceInCents - activeCoupon.discountValue,
            );
          }
        }
      }

      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: `${item.productVariant.product.name} - ${item.productVariant.name}`,
            description: item.productVariant.product.description,
            images: [item.productVariant.imageUrl],
          },
          unit_amount: priceInCents,
        },
        quantity: item.quantity,
      };
    }),
  });

  // ✅ Retorno seguro para o client
  return { id: checkoutSession.id };
};
