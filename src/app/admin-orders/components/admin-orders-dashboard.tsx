"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCentsToBRL } from "@/helpers/money";

import { orderStatus } from "@/db/schema";
import { updateOrderStatusAction } from "./actions/update-status";
import { Header } from "@/components/common/header";

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

// =======================
// LABELS DO MÉTODO DE ENTREGA
// =======================
const shippingLabelMap: Record<string, string> = {
  cold: "Entrega Cold Breeze",
  sedex: "SEDEX",
  pac: "PAC (Correios)",
};

export default function AdminOrdersDashboard({ orders }: { orders: any[] }) {
  return (
    <div className="min-h-screen p-8 text-white">
      <Header /> 
      <h1 className="mb-6 text-3xl font-bold">Pedidos</h1>

      {orders.length === 0 && (
        <p className="text-gray-400">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-5">
        {orders.map((order) => {
          const shippingLabel =
            shippingLabelMap[order.shippingMethod] || "Não informado";

          return (
            <Card
              key={order.id}
              className="rounded-xl text-white border border-white/10 bg-[#0f1628] p-5"
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

                  {/* FORM STATUS (AGORA CORRETO) */}
                  <form action={updateOrderStatusAction} className="mt-3">
                    <input type="hidden" name="orderId" value={order.id} />

                    <select
                      name="status"
                      defaultValue={order.status}
                      className="rounded-md bg-white/10 px-2 py-1 text-sm text-white"
                    >
                      <option value="pending" className="bg-black">Pendente</option>
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
                    {order.status === "pending" && <Badge variant="outline">Pendente</Badge>}
                    {order.status === "in_production" && <Badge className="bg-yellow-600">Em produção</Badge>}
                    {order.status === "on_the_way" && <Badge className="bg-blue-600">A caminho</Badge>}
                    {order.status === "delivered" && <Badge className="bg-green-600">Entregue</Badge>}
                    {order.status === "canceled" && <Badge variant="destructive">Cancelado</Badge>}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {formatCentsToBRL(order.totalPriceInCents)}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              {/* ITENS */}
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

              {/* ENDEREÇO */}
              <div>
                <h3 className="mb-1 text-sm font-semibold">Endereço de Entrega</h3>

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
                  <p className="text-xs text-red-400">Nenhum endereço disponível</p>
                )}
              </div>

              {/* MÉTODO DE ENTREGA */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-1">Entrega</h3>

                <p className="text-xs text-blue-300">
                  Método: {shippingLabel}
                </p>

                <p className="text-xs text-green-400 mt-1">
                  Frete:{" "}
                  {order.shippingInCents === 0
                    ? "GRÁTIS"
                    : formatCentsToBRL(order.shippingInCents)}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
