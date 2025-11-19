import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import ConfirmationClient from "./components/confirmation-client";

import { calculateShipping } from "@/actions/shipping/calculate-shipping";

const ConfirmationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) redirect("/");

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

  // =========================
  // SUBTOTAL
  // =========================
  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0
  );

  // =========================
  // FRETE
  // =========================
  const shipping = await calculateShipping({
    city: cart.shippingAddress.city,
    state: cart.shippingAddress.state,
  });

  const shippingInCents = Math.round((shipping?.price ?? 0) * 100);

  // =========================
  // TOTAL SEM CUPOM (CUPOM É CALCULADO CLIENT-SIDE)
  // =========================
  const totalInCents = cartTotalInCents + shippingInCents;

  return (
    <div>
      <Header />

      <ConfirmationClient
        cart={{
          subtotal: cartTotalInCents,
          shippingInCents,
          total: totalInCents,
          address: cart.shippingAddress,

          // ====== CORREÇÃO DA KEY =======
          items: cart.items.map((item) => ({
            id: item.id, // <<< AGORA SIM: KEY ÚNICA
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
