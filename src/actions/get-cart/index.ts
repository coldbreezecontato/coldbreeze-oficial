"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import {
  cartTable,
  productVariantSizeTable,
  productVariantTable,
  productSizeTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export const getCart = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 🔹 Usuário NÃO autenticado → carrinho vazio
    if (!session?.user) {
      return {
        id: null,
        userId: null,
        items: [],
        totalPriceInCents: 0,
        shippingAddress: null,
      };
    }

    // 🔹 Buscar carrinho com relações
    const cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, session.user.id),
      with: {
        shippingAddress: true,
        items: {
          with: {
            productVariant: {
              with: {
                product: true, // 🔥 AQUI pega o stock do produto!
                sizes: {
                  with: {
                    size: true,
                  },
                },
              },
            },

            productVariantSize: {
              with: {
                size: true,
              },
            },
          },
        },
      },
    });

    // 🔹 Se não existir carrinho → cria um vazio
    if (!cart) {
      const [newCart] = await db
        .insert(cartTable)
        .values({ userId: session.user.id })
        .returning();

      return {
        ...newCart,
        items: [],
        totalPriceInCents: 0,
        shippingAddress: null,
      };
    }

    // 🔹 Calcula subtotal
    const totalPriceInCents = cart.items.reduce((acc, item) => {
      return acc + item.productVariant.priceInCents * item.quantity;
    }, 0);

    return {
      ...cart,
      totalPriceInCents,
    };
  } catch (err) {
    console.error("❌ Erro ao obter o carrinho:", err);

    return {
      id: null,
      userId: null,
      items: [],
      totalPriceInCents: 0,
      shippingAddress: null,
    };
  }
};
