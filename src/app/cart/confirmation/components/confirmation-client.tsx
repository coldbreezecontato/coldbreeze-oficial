"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAddress } from "../../helpers/address";
import FinishOrderButton from "./finish-order-button";
import CartSummary from "../../components/cart-summary";

export default function ConfirmationClient({ cart }: any) {
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const discount = appliedCoupon
    ? appliedCoupon.type === "PERCENT"
      ? Math.round((cart.subtotal * appliedCoupon.value) / 100)
      : appliedCoupon.value
    : 0;

  const totalWithDiscount = cart.subtotal - discount;

  return (
    <div className="space-y-4 px-5 mt-5">
      <Card className="bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] 
        border-b border-[#0a84ff]/20 text-white">
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Card className="bg-gradient-to-r from-[#0a0f1f] via-[#0c1a33] to-[#08111f] 
            border-b border-[#0a84ff]/20 text-white">
            <CardContent>
              <p className="text-sm">{formatAddress(cart.address)}</p>
            </CardContent>
          </Card>

          <FinishOrderButton onCouponApplied={setAppliedCoupon} />
        </CardContent>
      </Card>

      <CartSummary
        subtotalInCents={cart.subtotal}
        discountInCents={discount}
        totalInCents={totalWithDiscount}
        products={cart.items}
      />
    </div>
  );
}
