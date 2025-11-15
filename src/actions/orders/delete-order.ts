"use server";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function deleteOrder(orderId: string, userId: string) {
  try {
    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, orderId),
    });

    if (!order || order.userId !== userId) {
      return { ok: false, message: "Pedido não encontrado." };
    }

    // Só pode excluir se estiver cancelado ou entregue
    if (order.status !== "canceled" && order.status !== "delivered") {
      return {
        ok: false,
        message: "Só é possível excluir pedidos cancelados ou entregues.",
      };
    }

    await db.delete(orderTable).where(eq(orderTable.id, orderId));

    return { ok: true, message: "Pedido removido com sucesso." };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Erro ao remover pedido." };
  }
}
