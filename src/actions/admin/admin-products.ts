"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { db } from "@/db";
import {
  productTable,
  productVariantTable,
  productVariantSizeTable,
} from "@/db/schema";

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

/* ==============================================
   CREATE PRODUCT
============================================== */
export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const name = (formData.get("name") || "").toString().trim();
    const categoryId = (formData.get("categoryId") || "").toString().trim();
    const description =
      (formData.get("description") || "").toString().trim() || "Cold Breeze";

    const variantsJSON = (formData.get("variants") || "[]").toString();

    // 🔥 CORREÇÃO: ler o estoque total
    const stockRaw = formData.get("stock");
    const stock = Number(stockRaw) || 0;

    if (!name || !categoryId) {
      return { ok: false, message: "Preencha todos os campos obrigatórios." };
    }

    const variants = JSON.parse(variantsJSON) as {
      color: string;
      priceInCents: number | string;
      imageUrl: string;
      sizes?: { sizeId: string; stock: number }[];
    }[];

    const productId = crypto.randomUUID();
    const slug = generateSlug(name);

    /* ------------------ CREATE PRODUCT ------------------ */
    await db.insert(productTable).values({
      id: productId,
      name,
      slug,
      categoryId,
      description,
      stock, // 🔥 Salva corretamente no banco!
    });

    /* ------------------ CREATE VARIANTS ------------------ */
    for (const variant of variants) {
      if (!variant.color?.trim()) continue;

      const variantId = crypto.randomUUID();

      await db.insert(productVariantTable).values({
        id: variantId,
        productId,
        name: variant.color,
        color: variant.color,
        imageUrl: variant.imageUrl || "",
        priceInCents: Number(variant.priceInCents) || 0,
        slug: generateSlug(`${name}-${variant.color}`),
      });

      /* ------------ VARIANT SIZES / STOCK ------------ */
      if (Array.isArray(variant.sizes)) {
        for (const size of variant.sizes) {
          const stockNumber = Number(size.stock);

          if (!size.sizeId || !Number.isFinite(stockNumber) || stockNumber <= 0)
            continue;

          await db.insert(productVariantSizeTable).values({
            id: crypto.randomUUID(),
            productVariantId: variantId,
            sizeId: size.sizeId,
            stock: stockNumber,
            createdAt: new Date(),
          });
        }
      }
    }

    revalidatePath("/admin");
    return { ok: true, message: "Produto criado com sucesso!" };
  } catch (err: any) {
    console.error("❌ Erro ao criar produto:", err);
    return {
      ok: false,
      message: err?.message ?? "Erro inesperado ao criar produto.",
    };
  }
}

/* ==============================================
   DELETE PRODUCT
============================================== */
export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!productId) return { ok: false, message: "ID inválido." };

  try {
    await db.transaction(async (tx) => {
      // Deleta variantes (sizes possuem CASCADE no schema)
      await tx
        .delete(productVariantTable)
        .where(eq(productVariantTable.productId, productId));

      await tx.delete(productTable).where(eq(productTable.id, productId));
    });

    revalidatePath("/admin");
    return { ok: true, message: "Produto removido com sucesso!" };
  } catch (err: any) {
    console.error("❌ Erro ao deletar produto:", err);
    return { ok: false, message: "Erro ao deletar produto." };
  }
}
