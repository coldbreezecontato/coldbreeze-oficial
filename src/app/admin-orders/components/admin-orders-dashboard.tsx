import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCentsToBRL } from "@/helpers/money";

import { updateOrderStatus } from "@/actions/admin/update-order-status";
import { orderStatus } from "@/db/schema";

// =======================
// TIPO DO ITEM DO PEDIDO
// =======================
type OrderItem = {
  id: string;
  quantity: number;
  productVariant?: {
    imageUrl: string;
    name: string;
    priceInCents: number;
    product: {
      name: string;
    };
  } | null;
  productVariantSize?: {
    size: {
      name: string;
    };
  } | null;
};

export default function AdminOrdersDashboard({ orders }: { orders: any[] }) {
  return (
    <div className="min-h-screen p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">Pedidos</h1>

      {orders.length === 0 && (
        <p className="text-gray-400">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-5">
        {orders.map((order) => (
          <Card
            key={order.id}
            className="rounded-xl border border-white/10 bg-[#0f1628] p-5"
          >
            <div className="mb-4 flex justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  Pedido feito em{" "}
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </p>

                <p className="mt-1 text-sm font-medium text-blue-300">
                  Cliente: {order.user?.name ?? "Cliente removido"}
                </p>

                {/* FORM STATUS */}
                <form
                  action={async (formData) => {
                    "use server";
                    const status =
                      formData.get("status") as (typeof orderStatus.enumValues)[number];

                    await updateOrderStatus(order.id, status);
                  }}
                  className="mt-3"
                >
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-md bg-white/10 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending" className="bg-black">Pendente</option>
                    <option value="paid" className="bg-black">Pago</option>
                    <option value="in_production" className="bg-black">Em produção</option>
                    <option value="on_the_way" className="bg-black">A caminho</option>
                    <option value="delivered" className="bg-black">Entregue</option>
                    <option value="canceled" className="bg-black">Cancelado</option>
                  </select>

                  <button
                    type="submit"
                    className="ml-2 rounded-md bg-blue-600 px-2 py-1 text-sm hover:bg-blue-700"
                  >
                    Atualizar
                  </button>
                </form>

                {/* BADGES */}
                <div className="mt-2 flex gap-2">
                  {order.status === "pending" && (
                    <Badge variant="outline">Pendente</Badge>
                  )}
                  {order.status === "paid" && <Badge>Pago</Badge>}
                  {order.status === "in_production" && (
                    <Badge className="bg-yellow-600">Em produção</Badge>
                  )}
                  {order.status === "on_the_way" && (
                    <Badge className="bg-blue-600">A caminho</Badge>
                  )}
                  {order.status === "delivered" && (
                    <Badge className="bg-green-600">Entregue</Badge>
                  )}
                  {order.status === "canceled" && (
                    <Badge variant="destructive">Cancelado</Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">
                  {formatCentsToBRL(order.totalPriceInCents)}
                </p>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="space-y-4">
              {order.items.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={item.productVariant?.imageUrl ?? ""}
                      alt="produto"
                      width={70}
                      height={70}
                      className="rounded-lg"
                    />

                    <div>
                      <p className="text-sm font-semibold">
                        {item.productVariant?.product?.name ??
                          "Produto removido"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {item.productVariant?.name ?? "--"} —{" "}
                        {item.productVariantSize?.size?.name ?? "--"} x{" "}
                        {item.quantity}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold">
                    {formatCentsToBRL(
                      item.quantity *
                        (item.productVariant?.priceInCents ?? 0)
                    )}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            <div>
              <h3 className="mb-1 text-sm font-semibold">
                Endereço de Entrega
              </h3>

              {order.shippingAddress ? (
                <p className="text-xs leading-5 text-gray-300">
                  {order.shippingAddress.street},{" "}
                  {order.shippingAddress.number}
                  <br />
                  {order.shippingAddress.neighborhood}
                  <br />
                  {order.shippingAddress.city} - {order.shippingAddress.state}
                  <br />
                  CEP: {order.shippingAddress.zipCode}
                </p>
              ) : (
                <p className="text-xs text-red-400">
                  Nenhum endereço disponível
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
