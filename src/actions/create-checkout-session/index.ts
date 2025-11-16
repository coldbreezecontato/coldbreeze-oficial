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
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set");
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Unauthorized");

  const { orderId, couponCode } = createCheckoutSessionSchema.parse(data);

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order) throw new Error("Order not found");
  if (order.userId !== session.user.id) throw new Error("Unauthorized");

  const appliedCoupon = couponCode
    ? await db.query.couponTable.findFirst({
        where: eq(couponTable.code, couponCode),
      })
    : null;

  const items = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
      productVariantSize: { with: { size: true } },
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20" as any,
  });

  // subtotal = soma dos produtos
  const subtotalInCents = items.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0
  );

  const total = order.totalPriceInCents;

  const discountInCents = appliedCoupon
    ? appliedCoupon.discountType === "PERCENT"
      ? Math.round((subtotalInCents * appliedCoupon.discountValue) / 100)
      : appliedCoupon.discountValue
    : 0;

  const shippingInCents = total - subtotalInCents + discountInCents;

  // ===============================================
  // 🔥 CORREÇÃO DO PROBLEMA DE PROMOTION CODE
  // ===============================================

  let promotionCodeId: string | undefined;

  if (discountInCents > 0 && appliedCoupon) {
    // Verifica se já existe promotion code com o mesmo código
    const existing = await stripe.promotionCodes.list({
      code: appliedCoupon.code,
      active: true,
      limit: 1,
    });

    if (existing.data.length > 0) {
      // Já existe → reaproveita
      promotionCodeId = existing.data[0].id;
    } else {
      // Cria cupom Stripe
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discountInCents,
        currency: "brl",
        duration: "once",
      });

      // Cria promotion code
      const promo = await stripe.promotionCodes.create({
        coupon: stripeCoupon.id,
        code: appliedCoupon.code,
      });

      promotionCodeId = promo.id;
    }
  }

  // ===============================================

  const line_items = items.map((item) => {
    const variant = item.productVariant;
    const product = variant?.product;
    const size = item.productVariantSize?.size;

    return {
      price_data: {
        currency: "brl",
        unit_amount: item.priceInCents,
        product_data: {
          name: `${product?.name ?? "Produto"} — ${
            variant?.name ?? "Variante"
          }`,
          description: `Tamanho: ${size?.name ?? "Único"}`,
          images: variant?.imageUrl ? [variant.imageUrl] : [],
        },
      },
      quantity: item.quantity,
    };
  });

  if (shippingInCents > 0) {
    line_items.push({
      price_data: {
        currency: "brl",
        unit_amount: shippingInCents,
        product_data: {
          name: "Frete",
          description: "Entrega ao destinatário",
          images: [],
        },
      },
      quantity: 1,
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: { orderId },
    line_items,
    discounts: promotionCodeId
      ? [{ promotion_code: promotionCodeId }]
      : undefined,
  });

  return { id: checkoutSession.id };
};
