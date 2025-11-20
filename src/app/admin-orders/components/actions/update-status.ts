"use server";

import { updateOrderStatus } from "@/actions/admin/update-order-status";
import { orderStatus } from "@/db/schema";

export async function updateOrderStatusAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;

  const status = formData.get("status") as (typeof orderStatus.enumValues)[number];

  await updateOrderStatus(orderId, status);
}
