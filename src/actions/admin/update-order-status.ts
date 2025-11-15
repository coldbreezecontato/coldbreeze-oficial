"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { orderTable, orderStatus } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: (typeof orderStatus.enumValues)[number]) {
  await db
    .update(orderTable)
    .set({ status })
    .where(eq(orderTable.id, orderId));

  revalidatePath("/admin-orders");

  return { ok: true };
}
