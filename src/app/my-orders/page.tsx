import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "@/components/common/header";
import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import Orders from "./components/orders";
import Image from "next/image";
import Link from "next/link";

import { DistanceService } from "@/lib/shipping/distance-service";

const MyOrdersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    redirect("/login");
  }

  // Busca pedidos do usuário
  const orders = await db.query.orderTable.findMany({
    where: eq(orderTable.userId, session.user.id),
    with: {
      items: {
        with: {
          productVariant: { with: { product: true } },
          productVariantSize: { with: { size: true } },
        },
      },
    },
  });

  // FORMATAÇÃO FINAL: Subtotal + Frete + Desconto
  const formattedOrders = await Promise.all(
    orders.map(async (order) => {
      // FRETE (DistanceService)
      const shippingInCents =
        Math.round((await DistanceService.calculate(order.city, order.state)) * 100);

      // SUBTOTAL: soma dos valores dos itens
      const subtotalInCents = order.items.reduce((acc, item) => {
        return (
          acc +
          (item.productVariant?.priceInCents ?? 0) * item.quantity
        );
      }, 0);

      // DESCONTO = subtotal - (total - frete)
      const discountInCents =
        subtotalInCents - (order.totalPriceInCents - shippingInCents);

      return {
        id: order.id,
        totalPriceInCents: order.totalPriceInCents, // total final salvo no pedido
        shippingInCents,
        subtotalInCents,
        discountInCents,
        status: order.status,
        createdAt: order.createdAt,

        items: order.items.map((item) => ({
          id: item.id,
          imageUrl: item.productVariant?.imageUrl ?? "",
          productName: item.productVariant?.product.name ?? "Produto removido",
          productVariantName: item.productVariant?.name ?? "",
          sizeName: item.productVariantSize?.size.name ?? "—",
          priceInCents: item.productVariant?.priceInCents ?? 0,
          quantity: item.quantity,
        })),
      };
    })
  );

  return (
    <>
      <Header />

      <div className="mt-8 px-5">
        {formattedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center mt-16">
            <Image
              src="/mascote-logo.svg"
              alt="Cold Breeze"
              width={280}
              height={280}
              className="opacity-90"
            />

            <h2 className="mt-2 text-xl font-semibold text-white">
              Você ainda não fez nenhum pedido 👀
            </h2>

            <p className="mt-2 text-sm text-gray-400 max-w-sm">
              Descubra os produtos exclusivos da Cold Breeze e faça parte da
              nossa comunidade de estilo.
            </p>

            <Link
              href="/"
              className="
                mt-6 px-6 py-3 rounded-full text-sm font-medium
                bg-gradient-to-r from-cyan-500 to-blue-600
                hover:opacity-90 transition-all
              "
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <Orders orders={formattedOrders} />
        )}
      </div>
    </>
  );
};

export default MyOrdersPage;
