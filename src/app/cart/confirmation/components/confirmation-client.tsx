"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAddress } from "../../helpers/address";
import FinishOrderButton from "./finish-order-button";
import CartSummary from "../../components/cart-summary";

export default function ConfirmationClient({ cart }: any) {
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // ============================================================
  // DESCONTOS
  // ============================================================
  const discount = appliedCoupon
    ? appliedCoupon.type === "PERCENT"
      ? Math.round(
          ((cart.subtotal + cart.shippingInCents) * appliedCoupon.value) / 100
        )
      : appliedCoupon.value
    : 0;

  const totalWithDiscount =
    cart.subtotal + cart.shippingInCents - discount;

  // ============================================================
  // LABEL DO MÉTODO DE ENTREGA
  // ============================================================
  const shippingLabelMap: Record<string, string> = {
    cold: "Entrega Cold Breeze",
    sedex: "SEDEX",
    pac: "PAC (Correios)",
  };

  const shippingMethodLabel =
    shippingLabelMap[cart.shippingMethod] || "Método não definido";

  return (
    <div className="space-y-4 px-5 mt-5">
      <Card
        className="bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]
        border-b border-[#0a84ff]/20 text-white"
      >
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Card
            className="bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f]
            border-b border-[#0a84ff]/20 text-white"
          >
            <CardContent>
              {/* ENDEREÇO */}
              <p className="text-sm">{formatAddress(cart.address)}</p>

              {/* MÉTODO DE ENTREGA */}
              {cart.shippingMethod && (
                <p className="text-sm text-blue-400 mt-2">
                  Método de entrega: {shippingMethodLabel}
                </p>
              )}

              {/* VALOR DO FRETE */}
              {typeof cart.shippingInCents === "number" && (
                <p className="text-sm text-green-400 mt-1">
                  Frete:{" "}
                  {(cart.shippingInCents / 100).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* ENVIA O TOTAL CORRETO */}
          <FinishOrderButton
            onCouponApplied={setAppliedCoupon}
            totalInCents={totalWithDiscount}
          />
        </CardContent>
      </Card>

      {/* RESUMO DO CARRINHO */}
      <CartSummary
        subtotalInCents={cart.subtotal}
        discountInCents={discount}
        shippingInCents={cart.shippingInCents}
        totalInCents={totalWithDiscount}
        products={cart.items}
      />
    </div>
  );
}
