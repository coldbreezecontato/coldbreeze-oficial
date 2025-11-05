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

  // 🔐 Autenticação
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) throw new Error("Unauthorized");

  // ✅ Validação
  const { orderId, couponCode } = createCheckoutSessionSchema.parse(data);

  // 🔎 Pedido
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });
  if (!order) throw new Error("Order not found");
  if (order.userId !== session.user.id) throw new Error("Unauthorized");

  // 🧾 Itens do pedido
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: {
        with: { product: true },
      },
    },
  });

  // ⚙️ Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

  // 🏷️ Cupom
  let activeCoupon: typeof couponTable.$inferSelect | null = null;
  if (couponCode) {
    const coupon = await db.query.couponTable.findFirst({
      where: eq(couponTable.code, couponCode),
    });
    if (coupon && coupon.isActive && coupon.expiresAt > new Date()) {
      activeCoupon = coupon;
    }
  }

  // 💳 Cria sessão
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId,
      couponCode: couponCode || "",
    },
    line_items: orderItems
      .filter((item) => !!item.productVariant) // 🔒 segurança extra
      .map((item, index) => {
        const variant = item.productVariant!; // ✅ garante que não é null
        const product = variant.product!;

        let priceInCents = item.priceInCents;

        if (activeCoupon) {
          if (activeCoupon.discountType === "PERCENT") {
            priceInCents = Math.round(
              item.priceInCents * (1 - activeCoupon.discountValue / 100),
            );
          } else if (activeCoupon.discountType === "FIXED" && index === 0) {
            priceInCents = Math.max(
              0,
              item.priceInCents - activeCoupon.discountValue,
            );
          }
        }

        return {
          price_data: {
            currency: "brl",
            product_data: {
              name: `${product.name} - ${variant.name}`,
              description: product.description,
              images: [variant.imageUrl],
            },
            unit_amount: priceInCents,
          },
          quantity: item.quantity,
        };
      }),
  });

  // ✅ Retorno
  return { id: checkoutSession.id };
};
