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

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const name = (formData.get("name") || "").toString().trim();
    const categoryId = (formData.get("categoryId") || "").toString().trim();
    const description = (formData.get("description") || "").toString().trim();
    const variantsJSON = (formData.get("variants") || "[]").toString();

    if (!name || !categoryId) {
      return { ok: false, message: "Campos obrigatórios ausentes." };
    }

    const variants = JSON.parse(variantsJSON) as {
      color: string;
      priceInCents: string;
      imageUrl: string;
      sizes?: { sizeId: string; stock: number }[];
    }[];

    const productId = crypto.randomUUID();
    const slug = generateSlug(name);

    // 🔹 Cria o produto
    await db.insert(productTable).values({
      id: productId,
      name,
      slug,
      categoryId,
      description: description || "Cold Breeze",
    });

    // 🔹 Cria cada variante + tamanhos da variante
    for (const variant of variants) {
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

      if (Array.isArray(variant.sizes) && variant.sizes.length > 0) {
        for (const size of variant.sizes) {
          if (!size.sizeId) continue;

          const stockNumber = Number(size.stock);
          if (!Number.isFinite(stockNumber) || stockNumber <= 0) continue;

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
    console.error(err);
    return { ok: false, message: err?.message ?? "Erro ao criar produto." };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  if (!productId) return { ok: false, message: "ID inválido." };

  try {
    await db.transaction(async (tx) => {
      // Apaga variantes (product_variant_size tem CASCADE no schema)
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
