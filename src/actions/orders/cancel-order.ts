"use server";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function cancelOrder(orderId: string, userId: string) {
  try {
    // Apenas pedidos pendentes podem ser cancelados pelo usuário
    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, orderId),
    });

    if (!order || order.userId !== userId) {
      return { ok: false, message: "Pedido não encontrado." };
    }

    if (order.status !== "pending") {
      return {
        ok: false,
        message: "Este pedido não pode mais ser cancelado.",
      };
    }

    await db
      .update(orderTable)
      .set({ status: "canceled" })
      .where(eq(orderTable.id, orderId));

    return { ok: true, message: "Pedido cancelado com sucesso!" };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Erro ao cancelar pedido." };
  }
}
