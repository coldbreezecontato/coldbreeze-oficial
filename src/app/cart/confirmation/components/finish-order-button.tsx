"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { applyCoupon } from "@/actions/coupon/apply-coupon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";

type FinishOrderButtonProps = {
  onCouponApplied: (coupon: any | null) => void;

  // 🔥 Agora recebemos tudo necessário
  subtotalInCents: number;
  shippingInCents: number;
  discountInCents: number;
  totalInCents: number;
};

export default function FinishOrderButton({
  onCouponApplied,
  subtotalInCents,
  shippingInCents,
  discountInCents,
  totalInCents,
}: FinishOrderButtonProps) {
  const finishOrderMutation = useFinishOrder();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);

  /* ============================================================
      CUPOM — APLICAR
  ============================================================ */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Digite um código de cupom.");

    try {
      setIsApplying(true);
      const coupon = await applyCoupon(couponCode);

      setAppliedCoupon(coupon);
      onCouponApplied(coupon);

      toast.success(`Cupom ${coupon.code} aplicado com sucesso!`);
    } catch (error: any) {
      toast.error(error.message || "Cupom inválido.");
      setAppliedCoupon(null);
      onCouponApplied(null);
    } finally {
      setIsApplying(false);
    }
  };

  /* ============================================================
      REMOVER CUPOM
  ============================================================ */
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    onCouponApplied(null);
    toast("Cupom removido.");
  };

  /* ============================================================
      FINALIZAR PEDIDO
  ============================================================ */
  const handleFinishOrder = async () => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) throw new Error("Stripe publishable key missing.");

    const couponToSend = appliedCoupon?.code || undefined;

    // 1. Criar pedido no backend
    const { orderId } = await finishOrderMutation.mutateAsync({
      couponCode: couponToSend,

      // 🔥 Agora enviamos tudo corretamente
      subtotalInCents,
      shippingInCents,
      discountInCents,
      totalPriceInCents: totalInCents,
    });

    // 2. Criar checkout session no Stripe
    const checkoutSession = await createCheckoutSession({
      orderId,
      couponCode: couponToSend,
    });

    // 3. Redirecionar
    const stripe = await loadStripe(publishableKey);
    if (!stripe) throw new Error("Failed to initialize Stripe.");

    await stripe.redirectToCheckout({ sessionId: checkoutSession.id });
  };

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <div className="flex gap-2">
          <Input
            placeholder="Digite seu cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="bg-white/5 text-white"
          />

          <Button onClick={handleApplyCoupon} disabled={isApplying}>
            {isApplying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-green-600/20 bg-green-600/10 px-3 py-2 text-green-400">
          <p className="text-sm font-medium">
            Cupom <strong>{appliedCoupon.code}</strong> aplicado —{" "}
            {appliedCoupon.type === "PERCENT"
              ? `${appliedCoupon.value}% off`
              : `R$ ${(appliedCoupon.value / 100).toFixed(2)} de desconto`}
          </p>

          <button
            onClick={handleRemoveCoupon}
            className="hover:text-red-400 transition"
            aria-label="Remover cupom"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        className="w-full rounded-full cursor-pointer font-semibold text-base tracking-wide"
        size="lg"
        onClick={handleFinishOrder}
        disabled={finishOrderMutation.isPending}
      >
        {finishOrderMutation.isPending && (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        )}
        Finalizar compra
      </Button>
    </div>
  );
}
