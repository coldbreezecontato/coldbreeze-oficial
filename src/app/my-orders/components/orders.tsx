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

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { orderTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";

import { cancelOrder } from "@/actions/orders/cancel-order";
import { deleteOrder } from "@/actions/orders/delete-order";
import { retryPayment } from "@/actions/orders/retry-payment";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

import {
  Truck,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

// =========================
// 📝 TIPAGEM
// =========================
interface OrdersProps {
  orders: Array<{
    id: string;
    totalPriceInCents: number;
    shippingInCents: number;
    subtotalInCents: number;
    discountInCents: number;
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

type OrderActionResponse = {
  ok: boolean;
  message?: string;
  url?: string;
};

// =========================
// 🚦 MAPEAMENTO DE STATUS
// =========================
const statusMap = {
  pending: {
    label: "Pagamento pendente",
    color: "border-yellow-500/50 text-yellow-400",
    icon: Clock,
  },
  in_production: {
    label: "Em produção",
    color: "border-blue-400/40 text-blue-300",
    icon: Package,
  },
  on_the_way: {
    label: "A caminho",
    color: "border-cyan-400/40 text-cyan-300",
    icon: Truck,
  },
  delivered: {
    label: "Entregue",
    color: "border-green-500/40 text-green-400",
    icon: CheckCircle2,
  },
  canceled: {
    label: "Cancelado",
    color: "border-red-600/40 text-red-500",
    icon: XCircle,
  },
};

// =========================
// 📦 COMPONENTE PRINCIPAL
// =========================
const Orders = ({ orders }: OrdersProps) => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? "";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // =========================
  // 🔧 AÇÕES DO PEDIDO
  // =========================
  const handleAction = async (
    orderId: string,
    action: "cancel" | "delete" | "retry"
  ) => {
    startTransition(async () => {
      let res: OrderActionResponse;

      switch (action) {
        case "cancel":
          res = await cancelOrder(orderId, userId);
          break;
        case "delete":
          res = await deleteOrder(orderId, userId);
          break;
        default:
          res = await retryPayment(orderId, userId);
      }

      if (res.ok) {
        if (res.url) {
          window.location.href = res.url;
          return;
        }

        toast.success(res.message ?? "Operação realizada!");
        router.refresh();
      } else {
        toast.error(res.message ?? "Erro ao processar ação");
      }
    });
  };

  // =========================
  // 🖼️ RENDERIZAÇÃO
  // =========================
  return (
    <div className="mb-6 space-y-5">
      {orders.map((order) => {
        const StatusIcon = statusMap[order.status].icon;

        return (
          <Card
            key={order.id}
            className="
              border border-[#0a84ff]/20
              bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]
              text-white shadow-xl rounded-xl transition-all
              hover:border-cyan-300/40 hover:shadow-cyan-500/10
            "
          >
            <CardContent className="py-4">
              <Accordion type="single" collapsible>
                <AccordionItem value={order.id}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          flex items-center gap-2 px-3 py-1 rounded-md border 
                          ${statusMap[order.status].color}
                        `}
                      >
                        <StatusIcon className="h-4 w-4" />
                        <p className="text-xs font-medium">
                          {statusMap[order.status].label}
                        </p>
                      </div>

                      <p className="text-xs opacity-70">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")} •{" "}
                        {new Date(order.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent>
                    {/* LISTA DE PRODUTOS */}
                    {order.items.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            width={80}
                            height={80}
                            className="rounded-lg shadow-md"
                          />

                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold">
                              {product.productName}
                            </p>

                            <p className="text-xs text-gray-300">
                              {product.productVariantName} — Tamanho:{" "}
                              {product.sizeName}
                              <span className="ml-1 opacity-70">
                                × {product.quantity}
                              </span>
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

                    <div className="py-4">
                      <Separator className="bg-white/10" />
                    </div>

                    {/* TIMELINE */}
                    <div className="bg-[#0d1529] border border-white/10 rounded-lg p-4 mb-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-cyan-400" />
                        Progresso do pedido
                      </h3>

                      <div className="space-y-2 text-xs text-gray-300">
                        <p>
                          <strong className="text-white">Pendente:</strong>{" "}
                          Aguardando pagamento.
                        </p>
                        <p>
                          <strong className="text-white">Em produção:</strong>{" "}
                          Preparando o envio.
                        </p>
                        <p>
                          <strong className="text-white">A caminho:</strong>{" "}
                          Pedido em rota de entrega.
                        </p>
                        <p>
                          <strong className="text-white">Entregue:</strong>{" "}
                          Chegou ao destino.
                        </p>
                        <p>
                          <strong className="text-white">Cancelado:</strong>{" "}
                          Pedido cancelado.
                        </p>
                      </div>
                    </div>

                    {/* AÇÕES */}
                    <div className="flex gap-3 mt-3">
                      {order.status === "pending" && (
                        <>
                          <button
                            disabled={isPending}
                            onClick={() => handleAction(order.id, "retry")}
                            className="
                              rounded-md bg-cyan-600 px-3 py-1 text-sm font-semibold 
                              hover:bg-cyan-700 transition-all shadow-lg 
                              disabled:opacity-50
                            "
                          >
                            {isPending ? "Processando..." : "Pagar agora"}
                          </button>

                          <button
                            disabled={isPending}
                            onClick={() => handleAction(order.id, "cancel")}
                            className="
                              rounded-md bg-red-600 px-3 py-1 text-sm 
                              hover:bg-red-700 shadow-md disabled:opacity-50
                            "
                          >
                            Cancelar pedido
                          </button>
                        </>
                      )}

                      {(order.status === "canceled" ||
                        order.status === "delivered") && (
                        <button
                          disabled={isPending}
                          onClick={() => handleAction(order.id, "delete")}
                          className="
                            rounded-md bg-gray-700 px-3 py-1 text-sm 
                            hover:bg-gray-800 shadow-md disabled:opacity-50
                          "
                        >
                          Excluir pedido
                        </button>
                      )}
                    </div>

                    {/* RESUMO FINAL */}
                    <div className="space-y-2 mt-5">
                      <div className="flex justify-between text-sm">
                        <p>Subtotal</p>
                        <p className="text-gray-300">
                          {formatCentsToBRL(order.subtotalInCents)}
                        </p>
                      </div>

                      <div className="flex justify-between text-sm">
                        <p>Desconto</p>
                        <p className="text-green-400">
                          {order.discountInCents > 0
                            ? `- ${formatCentsToBRL(order.discountInCents)}`
                            : "—"}
                        </p>
                      </div>

                      <div className="flex justify-between text-sm">
                        <p>Frete</p>
                        <p className="text-gray-300">
                          {order.shippingInCents === 0
                            ? "GRÁTIS"
                            : formatCentsToBRL(order.shippingInCents)}
                        </p>
                      </div>

                      <div className="flex justify-between text-sm font-semibold">
                        <p>Total</p>
                        <p>{formatCentsToBRL(order.totalPriceInCents)}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Orders;
