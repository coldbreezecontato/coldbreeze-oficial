import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { orderTable } from "@/db/schema";

export const config = {
  api: {
    bodyParser: false, // ❗ O Stripe exige o RAW BODY
  },
};

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecret) {
    console.error("❌ Missing STRIPE env vars");
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("❌ Webhook sem assinatura");
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = new Stripe(stripeSecret);

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error("❌ Erro constructEvent:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  /* =====================================
     🔥 EVENTO DE CHECKOUT FINALIZADO
  ====================================== */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("❌ orderId não veio no metadata do checkout");
      return NextResponse.json({ ok: true });
    }

    // Atualiza status do pedido
    await db
      .update(orderTable)
      .set({ status: "in_production" })
      .where(eq(orderTable.id, orderId));

    console.log("✅ Pedido atualizado:", orderId);
  }

  return NextResponse.json({ ok: true });
}
