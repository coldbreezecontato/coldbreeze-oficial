"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";

type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const name = (formData.get("name") || "").toString().trim();
    const categoryId = (formData.get("categoryId") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const variantsJSON = (formData.get("variants") || "[]").toString();

    if (!name || !categoryId)
      return { ok: false, message: "Campos obrigatórios ausentes." };

    const variants = JSON.parse(variantsJSON);

    const productId = crypto.randomUUID();
    const slug = generateSlug(name);

    await db.insert(productTable).values({
      id: productId,
      name,
      slug,
      categoryId,
      description: description || "Cold Breeze",
    });

    for (const variant of variants) {
      await db.insert(productVariantTable).values({
        id: crypto.randomUUID(),
        productId,
        name: variant.color,
        color: variant.color,
        imageUrl: variant.imageUrl || "",
        priceInCents: Number(variant.priceInCents) || 0,
        slug: generateSlug(`${name}-${variant.color}`),
      });
    }

    revalidatePath("/admin");
    return { ok: true, message: "Produto criado com sucesso!" };
  } catch (err: any) {
    console.error(err);
    return { ok: false, message: err?.message ?? "Erro ao criar produto." };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!productId) return { ok: false, message: "ID inválido." };
  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(productVariantTable)
        .where(eq(productVariantTable.productId, productId));
      await tx.delete(productTable).where(eq(productTable.id, productId));
    });
    revalidatePath("/admin");
    return { ok: true, message: "Produto removido com sucesso." };
  } catch (err: any) {
    console.error(err);
    return { ok: false, message: "Erro ao deletar produto." };
  }
}
