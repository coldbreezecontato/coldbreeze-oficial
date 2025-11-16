"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "@/components/common/header";
import Footer from "@/components/common/footer";
import { db } from "@/db";
import { cartTable, shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import Addresses from "./components/addresses";

export default async function IdentificationPage() {
  // ============================================================
  // 1) SESSION & AUTH
  // ============================================================
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user.id;
  if (!userId) {
    redirect("/login");
  }

  // ============================================================
  // 2) GET CART WITH ALL NECESSARY RELATIONS
  // ============================================================
  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, userId),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: {
            with: { product: true },
          },
        },
      },
    },
  });

  // Usuário sem carrinho → volta para home
  if (!cart || cart.items.length === 0) {
    redirect("/");
  }

  // ============================================================
  // 3) LOAD USER SHIPPING ADDRESSES
  // ============================================================
  const shippingAddresses = await db.query.shippingAddressTable.findMany({
    where: eq(shippingAddressTable.userId, userId),
  });

  // ============================================================
  // 4) CALCULATE CART TOTAL (if needed later)
  // ============================================================
  const cartTotalInCents = cart.items.reduce(
    (total, item) =>
      total + item.productVariant.priceInCents * item.quantity,
    0
  );

  // ============================================================
  // 5) RENDER PAGE
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-5 mt-6 space-y-6">
        <Addresses
          shippingAddresses={shippingAddresses}
          defaultShippingAddressId={cart.shippingAddress?.id ?? null}
        />
      </main>

      <Footer />
    </div>
  );
}
