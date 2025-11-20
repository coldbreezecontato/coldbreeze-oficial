import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import ConfirmationClient from "./components/confirmation-client";

const ConfirmationPage = async () => {
  // ============================================================
  // SESSION
  // ============================================================
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) redirect("/");

  // ============================================================
  // BUSCAR CARRINHO COMPLETO
  // ============================================================
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, session.user.id),
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

  if (!cart || cart.items.length === 0) redirect("/");
  if (!cart.shippingAddress) redirect("/cart/identification");

  // ============================================================
  // SUBTOTAL
  // ============================================================
  const subtotal = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0
  );

  // ============================================================
  // FRETE — CORREÇÃO AQUI
  // ============================================================
  const shippingInCents = Math.round(cart.shippingPriceInCents ?? 0);
  const shippingMethod = cart.shippingMethod ?? null;

  // ============================================================
  // TOTAL
  // ============================================================
  const totalInCents = subtotal + shippingInCents;

  // ============================================================
  // RETORNO
  // ============================================================
  return (
    <div>
      <Header />

      <ConfirmationClient
        cart={{
          subtotal,
          shippingInCents,
          shippingMethod,
          total: totalInCents,
          address: cart.shippingAddress,

          items: cart.items.map((item) => ({
            id: item.id,
            name: item.productVariant.product.name,
            variantName: item.productVariant.name,
            quantity: item.quantity,
            priceInCents: item.productVariant.priceInCents,
            imageUrl: item.productVariant.imageUrl,
          })),
        }}
      />

      <Footer />
    </div>
  );
};

export default ConfirmationPage;
