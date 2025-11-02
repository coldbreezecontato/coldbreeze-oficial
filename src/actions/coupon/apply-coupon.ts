"use server";

import { db } from "@/db";
import { couponTable } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function applyCoupon(code: string) {
  const now = new Date();

  const coupon = await db.query.couponTable.findFirst({
    where: and(
      eq(couponTable.code, code.toUpperCase()),
      eq(couponTable.isActive, true),
      gt(couponTable.expiresAt, now)
    ),
  });

  if (!coupon) {
    throw new Error("Cupom inválido ou expirado.");
  }

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.discountType,
    value: coupon.discountValue,
  };
}
