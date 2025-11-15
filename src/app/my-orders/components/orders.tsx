"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orderTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cancelOrder } from "@/actions/orders/cancel-order";
import { deleteOrder } from "@/actions/orders/delete-order";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface OrdersProps {
  orders: Array<{
    id: string;
    totalPriceInCents: number;
    status: (typeof orderTable.$inferSelect)["status"];
    createdAt: Date;
    items: Array<{
      id: string;
      imageUrl: string;
      productName: string;
      productVariantName: string;
      sizeName: string;
      priceInCents: number;
      quantity: number;
    }>;
  }>;
}

const Orders = ({ orders }: OrdersProps) => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleCancel = (orderId: string) => {
    startTransition(async () => {
      const res = await cancelOrder(orderId, userId);

      if (res.ok) {
        toast.success(res.message);
        router.refresh(); // <--- ATUALIZA A PÁGINA AUTOMATICAMENTE
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = (orderId: string) => {
    startTransition(async () => {
      const res = await deleteOrder(orderId, userId);

      if (res.ok) {
        toast.success(res.message);
        router.refresh(); // <--- ATUALIZA DE NOVO
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="mb-3 space-y-5">
      {orders.map((order) => (
        <Card
          key={order.id}
          className="border-b border-[#0a84ff]/20 bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] text-white"
        >
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex flex-col gap-1">
                    {order.status === "pending" && (
                      <Badge variant="outline">Pagamento pendente</Badge>
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

                    <p>
                      Pedido feito em{" "}
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </AccordionTrigger>

                <AccordionContent>
                  {order.items.map((product) => (
                    <div
                      className="flex items-center justify-between"
                      key={product.id}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={product.imageUrl}
                          alt={product.productName}
                          width={78}
                          height={78}
                          className="rounded-lg"
                        />

                        <div className="flex flex-col gap-1">
                          <p className="text-sm font-semibold">
                            {product.productName}
                          </p>
                          <p className="text-muted-foreground text-xs font-medium">
                            {product.productVariantName} — Tamanho:{" "}
                            {product.sizeName} x {product.quantity}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm font-bold">
                        {formatCentsToBRL(
                          product.priceInCents * product.quantity
                        )}
                      </p>
                    </div>
                  ))}

                  <div className="py-5">
                    <Separator />
                  </div>

                  {/* BOTÕES DO USUÁRIO */}
                  <div className="flex justify-between mt-3">
                    {order.status === "pending" && (
                      <button
                        disabled={isPending}
                        onClick={() => handleCancel(order.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-sm hover:bg-red-700"
                      >
                        Cancelar pedido
                      </button>
                    )}

                    {(order.status === "canceled" ||
                      order.status === "delivered") && (
                      <button
                        disabled={isPending}
                        onClick={() => handleDelete(order.id)}
                        className="rounded-md bg-gray-700 px-3 py-1 text-sm hover:bg-gray-800"
                      >
                        Excluir pedido
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mt-5">
                    <div className="flex justify-between">
                      <p className="text-sm">Subtotal</p>
                      <p className="text-muted-foreground text-sm font-medium">
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-sm">Frete</p>
                      <p className="text-muted-foreground text-sm font-medium">
                        GRÁTIS
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <p className="text-sm">Total</p>
                      <p className="text-sm font-semibold">
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Orders;
