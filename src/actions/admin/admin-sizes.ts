"use server";

import { db } from "@/db";
import { productSizeTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

// NOTA: Server Actions chamadas via <form action={...}> NÃO DEVEM RETORNAR NADA

function slugify(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/* -------------------------------------------
   CREATE SIZE (core)
-------------------------------------------- */
async function createSize(name: string) {
  await db.insert(productSizeTable).values({
    id: crypto.randomUUID(),
    name,
    slug: slugify(name),
    order: 0,
  });

  revalidatePath("/admin");
}

/* -------------------------------------------
   DELETE SIZE (core)
-------------------------------------------- */
async function deleteSize(sizeId: string) {
  await db.delete(productSizeTable).where(eq(productSizeTable.id, sizeId));

  revalidatePath("/admin");
}

/* -------------------------------------------
   SERVER ACTIONS (para o <form action>)
-------------------------------------------- */
export async function createSizeAction(formData: FormData): Promise<void> {
  const name = formData.get("sizeName")?.toString() ?? "";
  if (!name.trim()) return;
  await createSize(name);
}

export async function deleteSizeAction(formData: FormData): Promise<void> {
  const id = formData.get("sizeId")?.toString() ?? "";
  if (!id) return;
  await deleteSize(id);
}
