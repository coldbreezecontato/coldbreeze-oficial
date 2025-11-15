"use server";

import { eq, and, inArray } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  productVariantTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

import { AddProductToCartSchema, addProductToCartSchema } from "./schema";

export const addProductToCart = async (data: AddProductToCartSchema) => {
  addProductToCartSchema.parse(data);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // 1. Busca variante com o produto
  const variant = await db.query.productVariantTable.findFirst({
    where: (v, { eq }) => eq(v.id, data.productVariantId),
    with: {
      product: true,
    },
  });

  if (!variant) throw new Error("Product variant not found");

  const product = variant.product;
  if (!product) throw new Error("Product not found");

  // 📦 ESTOQUE TOTAL DO PRODUTO
  const totalStock = product.stock;

  // 2. Busca carrinho do usuário
  let cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
  });

  if (!cart) {
    const [newCart] = await db
      .insert(cartTable)
      .values({ userId: session.user.id })
      .returning();

    cart = newCart;
  }

  // 3. Buscar todas as variantes desse produto
  const productVariants = await db
    .select({ id: productVariantTable.id })
    .from(productVariantTable)
    .where(eq(productVariantTable.productId, product.id));

  const variantIds = productVariants.map((v) => v.id);

  // 4. SOMA TODAS AS QUANTIDADES no carrinho do usuário,
  // NÃO importando qual variante ou tamanho selecionado
  const allItemsOfProduct = await db.query.cartItemTable.findMany({
    where: and(
      eq(cartItemTable.cartId, cart.id),
      inArray(cartItemTable.productVariantId, variantIds)
    ),
  });

  const totalAlreadyInCart = allItemsOfProduct.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const newTotal = totalAlreadyInCart + data.quantity;

  // 🚨 VALIDAÇÃO DE ESTOQUE TOTAL
  if (newTotal > totalStock) {
    throw new Error("OUT_OF_STOCK");
  }

  // 4. Procura item específico (mesma variante + tamanho)
  const existingItem = await db.query.cartItemTable.findFirst({
    where: and(
      eq(cartItemTable.cartId, cart.id),
      eq(cartItemTable.productVariantId, data.productVariantId),
      eq(cartItemTable.productVariantSizeId, data.productVariantSizeId)
    ),
  });

  if (existingItem) {
    await db
      .update(cartItemTable)
      .set({ quantity: existingItem.quantity + data.quantity })
      .where(eq(cartItemTable.id, existingItem.id));
  } else {
    await db.insert(cartItemTable).values({
      cartId: cart.id,
      productVariantId: data.productVariantId,
      productVariantSizeId: data.productVariantSizeId,
      quantity: data.quantity,
    });
  }

  return { ok: true };
};
