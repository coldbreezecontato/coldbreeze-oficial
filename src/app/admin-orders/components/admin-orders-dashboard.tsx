import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCentsToBRL } from "@/helpers/money";

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

                <div className="mt-2">
                  {order.status === "paid" && <Badge>Pago</Badge>}
                  {order.status === "pending" && (
                    <Badge variant="outline">Pendente</Badge>
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
                  {/* LEFT */}
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

                  {/* RIGHT */}
                  <p className="text-sm font-semibold">
                    {formatCentsToBRL(
                      item.quantity * (item.productVariant?.priceInCents ?? 0),
                    )}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-3" />

            {/* ENDEREÇO */}
            <div>
              <h3 className="mb-1 text-sm font-semibold">
                Endereço de Entrega
              </h3>

              {order.shippingAddress ? (
                <p className="text-xs leading-5 text-gray-300">
                  {order.shippingAddress.street}, {order.shippingAddress.number}
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
