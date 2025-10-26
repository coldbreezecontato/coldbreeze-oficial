"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getCart = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 🔹 Caso o usuário não esteja autenticado
    if (!session?.user) {
      console.warn("⚠️ Nenhum usuário autenticado — retornando carrinho vazio.");
      return {
        id: null,
        userId: null,
        items: [],
        totalPriceInCents: 0,
        shippingAddress: null,
      };
    }

    // 🔹 Busca o carrinho existente
    const cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, session.user.id),
      with: {
        shippingAddress: true,
        items: {
          with: {
            productVariant: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });

    // 🔹 Se não existir, cria um novo carrinho para o usuário
    if (!cart) {
      const [newCart] = await db
        .insert(cartTable)
        .values({
          userId: session.user.id,
        })
        .returning();

      return {
        ...newCart,
        items: [],
        totalPriceInCents: 0,
        shippingAddress: null,
      };
    }

    // 🔹 Retorna o carrinho com total calculado
    return {
      ...cart,
      totalPriceInCents: cart.items.reduce(
        (acc, item) =>
          acc + item.productVariant.priceInCents * item.quantity,
        0,
      ),
    };
  } catch (err) {
    console.error("❌ Erro ao obter o carrinho:", err);

    // 🔹 Fallback total: evita quebrar SSR
    return {
      id: null,
      userId: null,
      items: [],
      totalPriceInCents: 0,
      shippingAddress: null,
    };
  }
};
