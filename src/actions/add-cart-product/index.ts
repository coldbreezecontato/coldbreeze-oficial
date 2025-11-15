"use server";

import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  productVariantTable,
  productVariantSizeTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  AddProductToCartSchema,
  addProductToCartSchema,
} from "./schema";

export const addProductToCart = async (data: AddProductToCartSchema) => {
  // validação com Zod
  addProductToCartSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // conferir se a variante existe
  const variant = await db.query.productVariantTable.findFirst({
    where: (variant, { eq }) => eq(variant.id, data.productVariantId),
  });

  if (!variant) {
    throw new Error("Product variant not found");
  }

  // conferir se o tamanho é válido e pertence à variante
  const variantSize = await db.query.productVariantSizeTable.findFirst({
    where: and(
      eq(productVariantSizeTable.id, data.productVariantSizeId),
      eq(productVariantSizeTable.productVariantId, data.productVariantId)
    ),
  });

  if (!variantSize) {
    throw new Error("INVALID_SIZE");
  }

  // buscar carrinho do usuário
  let cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
  });

  // criar carrinho se não existir
  if (!cart) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId: session.user.id,
      })
      .returning();

    cart = newCart;
  }

  // verificar se item COM MESMA VARIANTE + MESMO TAMANHO já existe
  const existingItem = await db.query.cartItemTable.findFirst({
    where: and(
      eq(cartItemTable.cartId, cart.id),
      eq(cartItemTable.productVariantId, data.productVariantId),
      eq(cartItemTable.productVariantSizeId, data.productVariantSizeId)
    ),
  });

  // se existir → só aumenta a quantidade
  if (existingItem) {
    await db
      .update(cartItemTable)
      .set({
        quantity: existingItem.quantity + data.quantity,
      })
      .where(eq(cartItemTable.id, existingItem.id));

    return { ok: true };
  }

  // caso não exista, cria um novo item no carrinho
  await db.insert(cartItemTable).values({
    cartId: cart.id,
    productVariantId: data.productVariantId,
    productVariantSizeId: data.productVariantSizeId,
    quantity: data.quantity,
  });

  return { ok: true };
};
