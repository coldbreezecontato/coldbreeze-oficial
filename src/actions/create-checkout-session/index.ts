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
  data: CreateCheckoutSessionSchema,
) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set");
  }

  // 🔐 Autenticação
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // ✅ Validação do schema
  const { orderId } = createCheckoutSessionSchema.parse(data);

  // 🔎 Busca o pedido
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order) throw new Error("Order not found");
  if (order.userId !== session.user.id) throw new Error("Unauthorized");

  // 🧾 Itens do pedido
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  // 💳 Cria a sessão no Stripe
  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: { orderId },
    line_items: orderItems.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: `${item.productVariant.product.name} - ${item.productVariant.name}`,
          description: item.productVariant.product.description,
          images: [item.productVariant.imageUrl],
        },
        unit_amount: item.priceInCents,
      },
      quantity: item.quantity,
    })),
  });

  // ✅ Retorne somente o que o client precisa
  return { id: checkoutSession.id };
};
