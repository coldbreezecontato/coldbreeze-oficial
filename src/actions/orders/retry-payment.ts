"use server";

import Stripe from "stripe";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";

export async function retryPayment(orderId: string, userId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Buscar o pedido com todos os dados necessários
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: {
      items: {
        with: {
          productVariant: {
            with: { product: true }, // <-- AQUI ESTÁ O QUE FALTAVA
          },
          productVariantSize: {
            with: { size: true },
          },
        },
      },
    },
  });

  if (!order || order.userId !== userId) {
    return { ok: false, message: "Pedido não encontrado." };
  }

  // Criar nova checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    metadata: {
      orderId: order.id,
    },
    line_items: order.items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: `${item.productVariant?.product.name} - ${item.productVariant?.name} (${item.productVariantSize?.size.name})`,
          images: [item.productVariant?.imageUrl ?? ""],
        },
        unit_amount: item.productVariant?.priceInCents ?? 0,
      },
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/my-orders`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/my-orders`,
  });

  return { ok: true, url: session.url! };
}
