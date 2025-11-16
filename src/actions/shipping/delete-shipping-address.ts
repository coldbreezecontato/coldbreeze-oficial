"use server";

import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { headers } from "next/headers";

export const deleteShippingAddress = async (shippingAddressId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    throw new Error("Usuário não autenticado");
  }

  // Verifica se o endereço pertence ao usuário
  const address = await db.query.shippingAddressTable.findFirst({
    where: eq(shippingAddressTable.id, shippingAddressId),
  });

  if (!address || address.userId !== session.user.id) {
    throw new Error("Endereço não encontrado ou não pertence ao usuário");
  }

  await db
    .delete(shippingAddressTable)
    .where(eq(shippingAddressTable.id, shippingAddressId));

  return { success: true };
};
